import { useEffect, useRef } from "react";

const DATE_FILTERS = [
	{ id: "Today", name: "Today" },
	{ id: "ThisWeek", name: "This Week" },
	{ id: "ThisMonth", name: "This Month" },
	{ id: "MonthToDate", name: "Month To Date" },
	{ id: "ThisQuarter", name: "This Quarter" },
	{ id: "QuarterToDate", name: "Quarter To Date" },
	{ id: "ThisYear", name: "This Year" },
	{ id: "YearToDate", name: "Year To Date" },
	{ id: "PreviousDay", name: "Previous Day" },
	{ id: "PreviousWeek", name: "Previous Week" },
	{ id: "PreviousMonth", name: "Previous Month" },
	{ id: "PreviousQuarter", name: "Previous Quarter" },
	{ id: "PreviousYear", name: "Previous Year" },
	{ id: "CustomDate", name: "Custom" }
];

const ENTITIES = [
	{ id: "invoice", name: "Invoice" },
	{ id: "creditnote", name: "Retainer" },
	{ id: "sales_without_invoices", name: "No invoice" },
	{ id: "journal", name: "Journal" },
	{ id: "sales_receipt", name: "Receipt" }
];

export default function Filters(props) {
	const menuRef = useRef(null);
	const selectedNames = ENTITIES
		.filter(function (entity) {
			return props.selectedEntities.indexOf(entity.id) !== -1;
		})
		.map(function (entity) {
			return entity.name;
		});

	useEffect(function () {
		function closeMenu(event) {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				props.onMenuOpen(false);
			}
		}
		document.addEventListener("click", closeMenu);
		return function () {
			document.removeEventListener("click", closeMenu);
		};
	}, [props.onMenuOpen]);

	function toggleEntity(id) {
		const next = props.selectedEntities.slice();
		const index = next.indexOf(id);
		if (index === -1) {
			next.push(id);
		} else {
			next.splice(index, 1);
		}
		props.onEntitiesChange(next);
	}

	return (
		<div className="toolbar">
			<div className="toolbar-top">
				<div className="filters-bar">
					<div className="filters-title">
						<svg className="filter-icon" viewBox="0 0 24 24" aria-hidden="true">
							<path d="M3 5h18l-7 8v5l-4 2v-7L3 5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
						</svg>
						<span>Filters :</span>
					</div>

					<div className="filter-chip date-chip">
						<span className="chip-key">Date Range :</span>
						<select
							aria-label="Date range"
							value={props.dateFilter}
							onChange={function (event) { props.onDateFilterChange(event.target.value); }}
						>
							<option value="">Select date range</option>
							{DATE_FILTERS.map(function (filter) {
								return <option key={filter.id} value={filter.id}>{filter.name}</option>;
							})}
						</select>
					</div>

					<div className={"filter-chip entity-chip" + (props.menuOpen ? " open" : "") + (selectedNames.length ? " has-value" : "")} ref={menuRef}>
						<button type="button" className="entity-toggle" onClick={function () { props.onMenuOpen(!props.menuOpen); }}>
							<span className="chip-key">Entities :</span>
							<span className="chip-value">{selectedNames.length ? selectedNames.join(", ") : "Select"}</span>
						</button>
						<button type="button" className="clear-x" aria-label="Clear entities" onClick={function (event) {
							event.stopPropagation();
							props.onEntitiesChange([]);
						}}>×</button>
						<span className="chip-divider"></span>
						<button type="button" className="chip-caret" aria-label="Open entities" onClick={function () { props.onMenuOpen(!props.menuOpen); }}>▾</button>
						<div className="entity-menu">
							{ENTITIES.map(function (entity) {
								const checked = props.selectedEntities.indexOf(entity.id) !== -1;
								return (
									<label key={entity.id} className={"menu-option" + (checked ? " active" : "")}>
										<input
											type="checkbox"
											checked={checked}
											onChange={function () { toggleEntity(entity.id); }}
										/>
										{entity.name}
									</label>
								);
							})}
						</div>
					</div>

					{props.dateFilter === "CustomDate" ? (
						<div className="custom-dates">
							<input type="date" aria-label="From date" value={props.fromDate} onChange={function (event) { props.onFromDateChange(event.target.value); }} />
							<input type="date" aria-label="To date" value={props.toDate} onChange={function (event) { props.onToDateChange(event.target.value); }} />
						</div>
					) : null}
				</div>

				<button className="btn" type="button" onClick={props.onApply}>Apply</button>

				<div className="toolbar-right">
					{props.summary ? (
						<div className="summary">
							<span><b>{props.summary.count}</b> customers</span>
							<span>Sales <b>{props.summary.sales}</b></span>
						</div>
					) : null}
					<div className="segmented">
						<button type="button" className={props.view === "table" ? "active" : ""} onClick={function () { props.onViewChange("table"); }}>Table</button>
						<button type="button" className={props.view === "chart" ? "active" : ""} onClick={function () { props.onViewChange("chart"); }}>Chart</button>
					</div>
				</div>
			</div>
		</div>
	);
}
