import { useEffect, useState } from "react";
import Filters from "./components/Filters.jsx";
import CustomerTable from "./components/CustomerTable.jsx";
import SalesChart from "./components/SalesChart.jsx";

function toYMD(date) {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return date.getFullYear() + "-" + month + "-" + day;
}

function formatMoney(amount, currencyCode) {
	try {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: currencyCode || "INR",
			maximumFractionDigits: 2
		}).format(Number(amount) || 0);
	} catch (e) {
		return String(amount || 0);
	}
}

function getSelectedDates(filterId, fromDate, toDate, organization) {
	if (filterId === "CustomDate") {
		if (!fromDate || !toDate) {
			return null;
		}
		return { from: fromDate, to: toDate };
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const fyStartMonth = Number(organization && organization.fiscal_year_start_month);
	const fyStart = fyStartMonth >= 1 && fyStartMonth <= 12 ? fyStartMonth : 4;
	const weekStart = new Date(today);
	weekStart.setDate(today.getDate() - today.getDay());
	const weekEnd = new Date(weekStart);
	weekEnd.setDate(weekStart.getDate() + 6);

	const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
	const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
	const quarter = Math.floor(today.getMonth() / 3);
	const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);
	const quarterEnd = new Date(today.getFullYear(), quarter * 3 + 3, 0);

	let fyYear = today.getFullYear();
	if (today.getMonth() + 1 < fyStart) {
		fyYear = fyYear - 1;
	}
	const yearStart = new Date(fyYear, fyStart - 1, 1);
	const yearEnd = new Date(fyYear + 1, fyStart - 1, 0);

	let start = monthStart;
	let end = monthEnd;

	if (filterId === "Today") {
		start = today;
		end = today;
	} else if (filterId === "ThisWeek") {
		start = weekStart;
		end = weekEnd;
	} else if (filterId === "ThisMonth") {
		start = monthStart;
		end = monthEnd;
	} else if (filterId === "MonthToDate") {
		start = monthStart;
		end = today;
	} else if (filterId === "ThisQuarter") {
		start = quarterStart;
		end = quarterEnd;
	} else if (filterId === "QuarterToDate") {
		start = quarterStart;
		end = today;
	} else if (filterId === "ThisYear") {
		start = yearStart;
		end = yearEnd;
	} else if (filterId === "YearToDate") {
		start = yearStart;
		end = today;
	} else if (filterId === "PreviousDay") {
		start = new Date(today);
		start.setDate(today.getDate() - 1);
		end = start;
	} else if (filterId === "PreviousWeek") {
		end = new Date(weekStart);
		end.setDate(weekStart.getDate() - 1);
		start = new Date(end);
		start.setDate(end.getDate() - 6);
	} else if (filterId === "PreviousMonth") {
		start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
		end = new Date(today.getFullYear(), today.getMonth(), 0);
	} else if (filterId === "PreviousQuarter") {
		start = new Date(today.getFullYear(), (quarter - 1) * 3, 1);
		end = new Date(today.getFullYear(), quarter * 3, 0);
	} else if (filterId === "PreviousYear") {
		start = new Date(fyYear - 1, fyStart - 1, 1);
		end = new Date(fyYear, fyStart - 1, 0);
	}

	return { from: toYMD(start), to: toYMD(end) };
}

const START_MESSAGE = "Select a date range and entities, then click Apply.";

export default function App() {
	const [organization, setOrganization] = useState(null);
	const [dateFilter, setDateFilter] = useState("");
	const [fromDate, setFromDate] = useState("");
	const [toDate, setToDate] = useState("");
	const [selectedEntities, setSelectedEntities] = useState([]);
	const [menuOpen, setMenuOpen] = useState(false);
	const [customers, setCustomers] = useState([]);
	const [view, setView] = useState("table");
	const [chartType, setChartType] = useState("bar");
	const [status, setStatus] = useState({ kind: "info", message: START_MESSAGE });
	const [summary, setSummary] = useState(null);

	useEffect(function () {
		const zfapps = window.ZFAPPS;
		if (!zfapps) {
			setStatus({ kind: "error", message: "Open this widget from the Zoho dashboard to load live data." });
			return;
		}

		zfapps.extension.init().then(function () {
			zfapps.get("organization").then(function (data) {
				setOrganization(data.organization);
			}).catch(function () {
				setStatus({ kind: "error", message: "Could not read organization details." });
			});
		});
	}, []);

	function applyFilters() {
		if (!organization) {
			setStatus({ kind: "error", message: "Please wait a moment and click Apply again." });
			setSummary(null);
			return;
		}
		if (!dateFilter) {
			setStatus({ kind: "error", message: "Please select a date range." });
			setSummary(null);
			return;
		}

		const dates = getSelectedDates(dateFilter, fromDate, toDate, organization);
		if (!dates) {
			setStatus({ kind: "error", message: "Please choose a From date and To date." });
			setSummary(null);
			return;
		}
		if (selectedEntities.length === 0) {
			setStatus({ kind: "error", message: "Please select at least one entity." });
			setSummary(null);
			return;
		}

		setStatus({ kind: "loading", message: "Loading top customers..." });

		const apiRoot = organization.api_root_endpoint || "/api/v3";
		window.ZFAPPS.request({
			url: apiRoot + "/reports/salesbycustomer",
			method: "GET",
			url_query: [
				{ key: "organization_id", value: organization.organization_id },
				{ key: "page", value: "1" },
				{ key: "usestate", value: "true" },
				{ key: "is_new_flow", value: "true" },
				{ key: "response_option", value: "1" },
				{ key: "from_date", value: dates.from },
				{ key: "to_date", value: dates.to },
				{ key: "entity_list", value: selectedEntities.join(",") },
				{ key: "filter_by", value: "TransactionDate." + dateFilter }
			],
			connection_link_name: "get_reports"
		}).then(function (response) {
			let body = response && response.data ? response.data.body : response;
			if (typeof body === "string") {
				body = JSON.parse(body);
			}

			const list = (body && (body.sales_by_customer || body.sales)) || [];
			const topCustomers = list.slice(0, 10);
			const totalSales = topCustomers.reduce(function (sum, row) {
				return sum + Number(row.sales || 0);
			}, 0);

			setCustomers(topCustomers);
			setSummary({
				count: topCustomers.length,
				sales: formatMoney(totalSales, topCustomers[0] && topCustomers[0].currency_code)
			});
			setStatus(null);
		}).catch(function (error) {
			console.error(error);
			setSummary(null);
			setStatus({ kind: "error", message: "Could not load sales by customer." });
		});
	}

	const currencyCode = (customers[0] && customers[0].currency_code) || "INR";

	return (
		<div className="widget">
			<Filters
				dateFilter={dateFilter}
				fromDate={fromDate}
				toDate={toDate}
				selectedEntities={selectedEntities}
				menuOpen={menuOpen}
				view={view}
				summary={summary}
				onDateFilterChange={setDateFilter}
				onFromDateChange={setFromDate}
				onToDateChange={setToDate}
				onEntitiesChange={setSelectedEntities}
				onMenuOpen={setMenuOpen}
				onApply={applyFilters}
				onViewChange={setView}
			/>

			<div className="content">
				{view === "chart" ? (
					<div className="chart-toolbar">
						<div className="segmented">
							<button type="button" className={chartType === "bar" ? "active" : ""} onClick={function () { setChartType("bar"); }}>Bar</button>
							<button type="button" className={chartType === "line" ? "active" : ""} onClick={function () { setChartType("line"); }}>Line</button>
							<button type="button" className={chartType === "pie" ? "active" : ""} onClick={function () { setChartType("pie"); }}>Pie</button>
						</div>
					</div>
				) : null}

				{status ? (
					<div className={"status show" + (status.kind === "error" ? " error" : "")}>
						{status.kind === "loading" ? <div className="spinner"></div> : null}
						<div>{status.message}</div>
					</div>
				) : null}

				{view === "table" ? (
					<CustomerTable customers={customers} currencyCode={currencyCode} />
				) : (
					<div className="chart-box">
						<SalesChart customers={customers} chartType={chartType} currencyCode={currencyCode} />
					</div>
				)}
			</div>
		</div>
	);
}
