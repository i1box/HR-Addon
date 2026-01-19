// Copyright (c) 2022, phamos.eu and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["Work Hour Report"] = {
	"filters": [
		{
			"fieldname":"prev_month",
			"label": __("Previous month"),
			"fieldtype": "Button",
			"icon": "fa fa-times",
			"width": "35px"
		},
		{
			"fieldname":"date_from_filter",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.get_day_diff(frappe.datetime, frappe.datetime.month_start()) < 15 ? frappe.datetime.add_months(frappe.datetime.month_start(),-1) : frappe.datetime.month_start(),
			"reqd": 1,
			"width": "35px"
		},
		{
			"fieldname":"date_to_filter",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.get_day_diff(frappe.datetime, frappe.datetime.month_start()) < 15 ? frappe.datetime.add_months(frappe.datetime.month_end(),-1) : frappe.datetime.get_today(),
			"reqd": 1,
			"width": "35px"
		},
		{
			"fieldname":"next_month",
			"label": __("Next month"),
			"fieldtype": "Button",
			"width": "35px"
		},
		{
			"fieldname":"employee_id",
			"label": __("Employee Id"),
			"fieldtype": "Link",
			"options": "Employee",
			"reqd": 1,
			"width": "35px"
		}
	],
	onload: function(report) {
		// console.log("onload", report)
		const css = `
		<style>
			/* show all */
			.datatable {
				max-height: calc(100vh - 260px);
				display: flex;
    			flex-direction: column;
			}
			.dt-header {
			    position: sticky;
				top: 0;
				z-index: 1;
				background: inherit;
			}
			.dt-footer {
			    position: sticky;
				bottom: 0;
				z-index: 1;
				background: inherit;
			}
			.datatable .dt-row {
				position: relative !important;
				top: 0 !important;
			}
			.datatable .dt-scrollable {
				height: 100% !important;
				max-height: none !important;
			}
		</style>`;
        if (!$("style#custom-report-style").length) {
            $(css).attr("id", "custom-report-style").appendTo("head");
        }

		this.report = report;
		self = this;

		// add a button to open the employee list to see all options
		const f3 = report.get_filter("employee_id")
		const $b = $('<button type="button" class="btn btn-sm position-absolute end-0 top-0" style="top: 0;right: 0;"><svg class="icon  icon-xs" style="" aria-hidden="true"><use class="" href="#icon-select"></use></svg></button>')
		$b.insertAfter(f3.$input)
		$b.off("click.a").on("click.a", function(){ f3.$input.val("").trigger("focus").trigger("input") })
		// --

		const fback = report.get_filter("prev_month")
		fback.$input
			.off("click.back")
			.on("click.back", function(event) {
				let d1 = report.get_filter_value("date_from_filter") || frappe.datetime.month_start()
				let dStart = frappe.datetime.add_months(d1, -1)
				self.setDateRange(dStart);
			})

		const fnext = report.get_filter("next_month")
		fnext.$input
			.off("click.next")
			.on("click.next", function(event) {
				let d1 = report.get_filter_value("date_from_filter") || frappe.datetime.month_start()
				let dStart = frappe.datetime.add_months(d1, 1)
				self.setDateRange(dStart);
			})
	},
	setDateRange: function(dStart) {
		this.report.set_filter_value("date_from_filter", dStart)
		this.report.set_filter_value("date_to_filter", moment(dStart).endOf("month").format())
	},
	"formatter": function (value, row, column, data, default_formatter) {
		value = default_formatter(value, row, column, data);
		if (column.fieldname == "total_work_seconds" ) {
			if(value < 0) {
				value = "<span style='color:red'>" + hitt(value) + "</span>";
			}
			else if(value > 0){
				value = "<span style='color:green'>" + hitt(value) + "</span>";
			}
			else{
				value = hitt(value);
			}
		}
		if (column.fieldname == "total_break_seconds" ) {
			if(value < 0) {
				value = "<span style='color:red'>" + hitt(value) + "</span>";
			}
			else if(value > 0){
				value = "<span style='color:green'>" + hitt(value) + "</span>";
			}
			else{
				value = hitt(value);
			}	
		}
		if (column.fieldname == "actual_working_seconds" ) {
			if(value < 0) {
				value = "<span style='color:red'>" +'-' + hitt(value ,true) + "</span>";
			}
			else if(value > 0){
				value = "<span style='color:green'>" + hitt(value) + "</span>";
			}
			else{
				value = hitt(value);
			}
		}
		if (column.fieldname == "total_target_seconds" ) {
			value = hitt(value);
		}
		if (column.fieldname == "expected_break_hours" ) {
			value = hitt(value);	
		}
		if (column.fieldname == "diff_log" ) {
			if(value < 0) {
				value = "<span style='color:#FF8C00'>" + hitt(value,true) + "</span>";
			}
			else if(value > 0){
				value = "<span style='color:blue'>" + hitt(value,true) + "</span>";
			}
			else{
				value = hitt(value,true);
			}
		}
		if (column.fieldname == "actual_diff_log" ) {
			if(value < 0) {
				// value = "<span style='color:#FF8C00'>" + hitt(value,true) + "</span>";
				value = "<span style='color:red'>" +"-"+ hitt(value,true) + "</span>";
			}
			else if(value > 0){
				value = "<span style='color:blue'>" + hitt(value,true) + "</span>";
			}
			else{
				value = hitt(value,true);
			}
		}
		return value;
	},
};
hitt = (fir, calDiff=false) =>{
	if(fir < 0 && !calDiff) return fir;

	if(fir < 0 && calDiff) {
		fir = fir.toString().replace(/^-+/,'');
	}

	d = Number(fir);
	if (d == 0) return d;

	var h = Math.floor(d / (60*60));
	var m = Math.floor(d % (60*60) / 60);
	var hDisplay = h > 0 ? h + "h " : "";
	var mDisplay = m > 0 ? m + "m " : "";
	const results = hDisplay+mDisplay;
	
	return results;
};
