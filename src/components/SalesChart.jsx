import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const CHART_COLORS = [
	"#408DFB", "#12B76A", "#F79009", "#EE46BC", "#7A5AF8",
	"#15B79E", "#F04438", "#6172F3", "#36BFFA", "#9AA4B2"
];

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

function formatPercent(value, total) {
	if (!total) {
		return "0%";
	}
	const pct = (Number(value) / total) * 100;
	if (Number(value) > 0 && pct < 0.01) {
		return "<0.01%";
	}
	if (pct < 1) {
		return pct.toFixed(2) + "%";
	}
	return pct.toFixed(1) + "%";
}

function pieDisplayValues(sales) {
	const total = sales.reduce(function (sum, value) {
		return sum + value;
	}, 0);
	if (!total) {
		return sales.slice();
	}
	const minSlice = total * 0.03;
	return sales.map(function (value) {
		return Math.max(value, minSlice);
	});
}

export default function SalesChart(props) {
	const canvasRef = useRef(null);
	const chartRef = useRef(null);
	const customers = props.customers;
	const chartType = props.chartType;
	const currencyCode = props.currencyCode;

	const names = [];
	const sales = [];
	let hasSales = false;
	for (let i = 0; i < customers.length; i++) {
		names.push(customers[i].customer_name || "Unknown");
		const amount = Number(customers[i].sales || 0);
		sales.push(amount);
		if (amount > 0) {
			hasSales = true;
		}
	}

	let message = "";
	if (customers.length === 0) {
		message = "No customers found for this period.";
	} else if (!hasSales) {
		message = "No sales data available to plot for this period.";
	}

	useEffect(function () {
		if (message || !canvasRef.current) {
			return;
		}

		const isPie = chartType === "pie";
		const isLine = chartType === "line";
		const colors = names.map(function (name, index) {
			return CHART_COLORS[index % CHART_COLORS.length];
		});
		const total = sales.reduce(function (sum, value) {
			return sum + value;
		}, 0);
		const offsets = sales.map(function (value) {
			return isPie && total > 0 && value / total < 0.05 ? 8 : 0;
		});

		const dataset = {
			label: "Total Sales",
			data: isPie ? pieDisplayValues(sales) : sales,
			backgroundColor: isPie ? colors : "rgba(64, 141, 251, 0.85)",
			borderColor: isPie ? "#ffffff" : "#408DFB",
			borderWidth: 2,
			offset: isPie ? offsets : 0,
			borderRadius: isPie ? 0 : 8,
			hoverBackgroundColor: isPie ? colors : "#2F6FD6",
			tension: 0.35,
			fill: isLine,
			pointRadius: isLine ? 4 : 0,
			pointBackgroundColor: "#408DFB",
			pointBorderColor: "#fff",
			pointBorderWidth: 2
		};

		if (isLine) {
			dataset.backgroundColor = "rgba(64, 141, 251, 0.12)";
		}

		chartRef.current = new Chart(canvasRef.current, {
			type: isLine ? "line" : (isPie ? "pie" : "bar"),
			data: { labels: names, datasets: [dataset] },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				layout: { padding: isPie ? 4 : 0 },
				plugins: {
					legend: {
						display: isPie,
						position: "right",
						labels: {
							usePointStyle: true,
							pointStyle: "circle",
							padding: 10,
							boxWidth: 8,
							font: { size: 10 },
							generateLabels: function (chart) {
								const colors = chart.data.datasets[0].backgroundColor || [];
								return chart.data.labels.map(function (label, index) {
									const value = Number(sales[index] || 0);
									return {
										text: label + "  " + formatPercent(value, total) + "  " + formatMoney(value, currencyCode),
										fillStyle: colors[index],
										strokeStyle: colors[index],
										hidden: false,
										index: index
									};
								});
							}
						}
					},
					tooltip: {
						backgroundColor: "#111827",
						padding: 10,
						cornerRadius: 8,
						callbacks: {
							label: function (context) {
								const value = isPie ? Number(sales[context.dataIndex] || 0) : context.parsed.y;
								if (isPie) {
									return " " + formatMoney(value, currencyCode) + " (" + formatPercent(value, total) + ")";
								}
								return " Sales: " + formatMoney(value, currencyCode);
							}
						}
					}
				},
				scales: isPie ? {} : {
					x: {
						grid: { display: false },
						ticks: {
							color: "#6B7280",
							font: { size: 11 },
							maxRotation: 35,
							callback: function (value) {
								const label = this.getLabelForValue(value);
								return label.length > 10 ? label.substring(0, 10) + "…" : label;
							}
						}
					},
					y: {
						beginAtZero: true,
						grid: { color: "rgba(229, 231, 235, 0.9)" },
						ticks: {
							color: "#6B7280",
							font: { size: 11 },
							callback: function (value) {
								if (value >= 10000000) {
									return (value / 10000000).toFixed(1) + "Cr";
								}
								if (value >= 100000) {
									return (value / 100000).toFixed(1) + "L";
								}
								if (value >= 1000) {
									return (value / 1000).toFixed(1) + "K";
								}
								return value;
							}
						}
					}
				}
			}
		});

		return function () {
			if (chartRef.current) {
				chartRef.current.destroy();
				chartRef.current = null;
			}
		};
	}, [chartType, currencyCode, message, customers]);

	if (message) {
		return <div className="chart-empty">{message}</div>;
	}

	return (
		<div className="chart-wrap">
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}
