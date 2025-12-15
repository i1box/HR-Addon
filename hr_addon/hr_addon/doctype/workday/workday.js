// Copyright (c) 2022, phamos.eu and contributors
// For license information, please see license.txt

frappe.ui.form.on('Workday', {
	setup: function(frm){
		frm.set_query("attendance",function(){
			return{
				"filters":[
					['Attendance','employee','=',frm.doc.employee],
					['Attendance','attendance_date','=',frm.doc.log_date],
					['Attendance','docstatus','=',1]
				]
			};
		});
	},

	refresh: function(frm) {

		frm.add_custom_button(__('Recreate workday'), function() {
			// @todo add option for recreate and max age
			const logDate = frappe.datetime.str_to_obj(frm.doc.log_date);
			const twoMonthsAgo = frappe.datetime.add_months(frappe.datetime.get_today(), -2);
			if (logDate < frappe.datetime.str_to_obj(twoMonthsAgo)) {
				frappe.throw(__('Log Date must not be older than 2 months: > {0}', [twoMonthsAgo]));
			}

			frappe.confirm(__('Are you sure you want to recreate this workday?'), function() {
				frappe.call({
					method: "hr_addon.hr_addon.doctype.workday.workday.recreate_workday",
					args: {
						employee: frm.doc.employee,
						date: frm.doc.log_date
					},
					callback: function(r) {
						if (r.message) {
							frappe.msgprint(__(r.message.message));
						}
						if (r.message.redirect) {
							frappe.set_route('Form', "Workday", r.message.redirect);
						}
					}
				});
			});
		});
	},

	log_date: function(frm){
		if (frm.doc.employee && frm.doc.log_date) {
			frappe.call({
				method: "hr_addon.hr_addon.doctype.workday.workday.date_is_in_holiday_list",
				args: {
					employee: frm.doc.employee,
					date: frm.doc.log_date
				},
				callback: function(r){
					if (r.message == false){
						get_hours(frm);
					} else {
						frappe.msgprint("Given Date is Holiday: " + r.message[0]["description"]);
						unset_fields(frm);
					}
				}
			})
		}
	},

	status(frm){
		if (frm.doc.status === "On Leave"){
			setTimeout(() => {
				frm.set_value("target_hours", 0)
				frm.set_value("expected_break_hours", 0)
				frm.set_value("actual_working_hours", 0)
			}, 1000);
		} // TODO: consider case of frm.doc.status === "Half Day"
	},

	attendance: function(frm){
		//get_hours(frm)
		
		if (frm.doc.employee_checkins && frm.doc.attendance){
			frappe.call({
				method: "hr_addon.hr_addon.doctype.workday.workday.set_attendance_in_employee_checkins",
				args: {
					employee_checkins: frm.doc.employee_checkins,
					attendance: frm.doc.attendance
				},
				callback: function(r){
					if (r.message == true){
						frm.save();
						frappe.show_alert({
							message:__('Attendance updated in Employee Checkins'),
							indicator:'green'
						}, 5);
					}
				}
			})
		}
	}
});

var get_hours = function(frm){
	let aemployee = frm.doc.employee;
	let adate = frm.doc.log_date;
	if(aemployee && adate){
		frappe.call({
			method:'hr_addon.hr_addon.doctype.workday.workday.get_actual_employee_log',
			args:{aemployee:aemployee,adate:adate}
		}).done((r)=>{
			if (r.message && Object.keys(r.message).length > 0) {
				frm.doc.employee_checkins = [];
				let alog = r.message;
				frm.set_value("hours_worked",alog.hours_worked);
				frm.set_value("break_hours",alog.break_hours);
				frm.set_value("target_hours",alog.target_hours);
				frm.set_value("expected_break_hours",(alog.expected_break_hours));
	
				frm.set_value("actual_working_hours", alog.actual_working_hours);
				let employee_checkins = alog.employee_checkins;
				if (employee_checkins) {
					frm.set_value("first_checkin",employee_checkins[0].time);
					frm.set_value("last_checkout",employee_checkins[employee_checkins.length-1].time);
					$.each(employee_checkins ,function(i,e){
						console.log(e)
						let nw_checkins = frm.add_child("employee_checkins");
						nw_checkins.employee_checkin = e.name;
						nw_checkins.log_type = e.log_type;
						nw_checkins.log_time = e.time;
						nw_checkins.skip_auto_attendance= e.skip_auto_attendance;
						refresh_field("employee_checkins");
					});
				}
			} else {
				unset_fields(frm);
			}

		})
	}
}

var unset_fields = function(frm) {
	frm.set_value("hours_worked", 0);
	frm.set_value("break_hours", 0);
	frm.set_value("target_hours", 0);
	frm.set_value("expected_break_hours", 0);
	frm.set_value("actual_working_hours", 0);
	frm.set_value("employee_checkins", []);
	frm.set_value("first_checkin", "");
	frm.set_value("last_checkout", "");
	frm.refresh_fields();
}