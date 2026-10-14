const AVATAR_COLORS = [
	"#408DFB", "#12B76A", "#F79009", "#EE46BC", "#7A5AF8",
	"#15B79E", "#F04438", "#6172F3", "#36BFFA", "#667085"
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

function getInitials(name) {
	const parts = String(name || "").trim().split(/\s+/);
	if (!parts[0]) {
		return "?";
	}
	if (parts.length === 1) {
		return parts[0].substring(0, 2).toUpperCase();
	}
	return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function CustomerTable(props) {
	const customers = props.customers;

	return (
		<div className="table-box">
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th style={{ textAlign: "right" }}>Invoice Count</th>
						<th style={{ textAlign: "right" }}>Sales</th>
					</tr>
				</thead>
				<tbody>
					{customers.length === 0 ? (
						<tr>
							<td colSpan="3"><div className="empty-inline">No customers found for this period.</div></td>
						</tr>
					) : customers.map(function (row, index) {
						const name = row.customer_name || "-";
						return (
							<tr key={row.customer_id || name + index}>
								<td>
									<div className="customer-cell">
										<span className={index < 3 ? "rank top" : "rank"}>{index + 1}</span>
										<span className="avatar" style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>{getInitials(name)}</span>
										<span className="customer-name" title={name}>{name}</span>
									</div>
								</td>
								<td className="number"><span className="count-pill">{row.count || 0}</span></td>
								<td className="number">{row.sales_formatted || formatMoney(row.sales, props.currencyCode)}</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
