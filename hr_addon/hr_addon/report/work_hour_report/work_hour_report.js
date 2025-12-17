// Copyright (c) 2022, phamos.eu and contributors
// For license information, please see license.txt
/* eslint-disable */
// show full month by default
// show last month info until 15th of current month
showLastMonth = frappe.datetime.get_day_diff(frappe.datetime, frappe.datetime.month_start()) < 15 ? true : false;
fromdate = showLastMonth ? frappe.datetime.add_months(frappe.datetime.month_start(),-1) : frappe.datetime.month_start();
todate = moment(fromdate).endOf("month").format();
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
			"default": fromdate,
			"reqd": 1,
			"width": "35px"
		},
		{
			"fieldname":"date_to_filter",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": todate,
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
	"onload_post_render": function(report) {
        // optional: nach Rendern noch einmal anpassen
        const wrapper = report.page.wrapper.querySelector(".report-wrapper .grid-container");
        if (wrapper) {
            wrapper.style.height = "600px";
        }
    },

	onload: function(report) {
		// Zugriff auf das DataTable-Wrapper-Element
		this.report = report;
		self = this;

		// add a button to open the employee list to see all options
		const f3 = report.get_filter("employee_id")
		const $b = $('<button type="button" class="btn btn-sm position-absolute end-0 top-0" style="top: 0;right: 0;"><svg class="icon  icon-xs" style="" aria-hidden="true"><use class="" href="#icon-select"></use></svg></button>')
		$b.insertAfter(f3.$input)
		let last = f3.$input.val();
		$b.off("click.a").on("click.a", function() { 
			last = f3.$input.val() || last;
			f3.$input.prop("placeholder", last);
			f3.$input.val("").trigger("focus").trigger("input");
		 })
		f3.$input.off("blur.once").on("blur.once", function(){
			if (f3.$input.val() == "") {
				// direct restore not working	
				setTimeout(() => {
					f3.$input.val(last);
					report.refresh();
				}, 1);
			}
		})
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
		
		setTimeout(() => {
			if (! f3.$input.val()) {
				$('[data-fieldname=employee_id]').focus()
			}
		}, 1000);
	},
	setDateRange: function(dStart) {
		this.report.set_filter_value("date_from_filter", dStart)
		this.report.set_filter_value("date_to_filter", moment(dStart).endOf("month").format())
	},
	"formatter": function (value, row, column, data, default_formatter) {
		value = default_formatter(value, row, column, data);

		// if working hours less than target hours, color red
		let bg = "";
		if (data && data.total_target_seconds && data.total_target_seconds + data.actual_diff_log < 3600) {
			//console.log(data);
			bg = "background-color: #ffcccc"; // red
		}

		if (column.fieldname == "status" ) {
			if (bg != "") {
				value = "<div style='" + bg + "'></div>";
			}
		}
		
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
<<<<<<< HEAD
				value = "<span style='color:red'>" +'-' + hitt(value ,true) + "</span>";
=======
				value = "<span style='color:red;" + bg + "'>" + hitt(value) + "</span>";
>>>>>>> 699ce2f (upd. autom. update workday)
			}
			else if(value > 0){
				value = "<span style='color:green'>" + hitt(value) + "</span>";
			}
			else{
				value = "<div style='" + bg + "'>" + hitt(value) + "</div>";
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
<<<<<<< HEAD
				// value = "<span style='color:#FF8C00'>" + hitt(value,true) + "</span>";
				value = "<span style='color:red'>" +"-"+ hitt(value,true) + "</span>";
=======
				value = "<div style='color:#FF8C00;" + bg + "'>" + hitt(value,true) + "</div>";
>>>>>>> 699ce2f (upd. autom. update workday)
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
