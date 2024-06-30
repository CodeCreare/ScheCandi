

class CandisCommon {
	static option_params	= [
		['WINSIZE',		'width',				1400],
		['WINSIZE',		'height',				800],
		['CONTENTS',	'slotsize',				15],
		['CONTENTS',	'starthour',			7],
		['CONTENTS',	'endhour',				20],
		['CONTENTS',	'min_needtime',			60],
		['APPERANCE',	'event_color_exist',	'darkgreen'],
		['APPERANCE',	'event_color_candi',	'orange'],
		['APPERANCE',	'event_color_newcandi',	'yellow'],
		['APPERANCE',	'event_color_ok',		'royalblue'],
		['APPERANCE',	'calendar_locale',		'ja'],
		['APPERANCE',	'title_color',			'lightcyan'],
		['APPERANCE',	'func_date2str',		GetDateStr],
		['WORDING',		'title_candi',			'候補日時'],
		['WORDING',		'title_schedule',		'タイトル'],
		['WORDING',		'title_needtime',		'必要時間'],
		['WORDING',		'candititle',			'候補{{candi_no}}'],
		['WORDING',		'needtime_shortage',	'必要時間({{needtime}}分)未満です'],
		['WORDING',		'nt_shortage_title',	'候補{{candi_no}}が必要時間({{needtime}}分)未満です'],

	];

	static CALID_EXISTS		= 'id_div_exists';
	static CALID_SELECTS	= 'id_div_selects';

	constructor() {
		var app	= this;
		$(window).off('focus');
		$(window).focus(
			function CB(e) {
				app.Cb_Window_Focus(e);
			}
		);
	}
	Cb_Window_Focus(e) {
		this.OP_Window_Focus(e);
	}
	
	get GetEditingCandi() {
		var info		= {};
		info.candicount	= this.candis.length;
		for (var candi of this.candis) {
			if (candi.editing) {
				info.candi	= candi;
				break;
			}
		}
		return info;
	}

	SetOptions(options) {
		var ischanged_winsize	= false;
		var ischanged_contents	= false;
		var ischanged_apperance	= false;
		var ischanged_wording	= false;
		var params		= CandisCommon.option_params;
		var params_add	= this.GetOptionParams();
		params			= params.concat(params_add);
		for (let key in options) {
			if (options[key]) {
				this.options[key]	= options[key];
				for (var param of params) {
					var param_type	= param[0];
					var param_key	= param[1];
					if (param_key == key) {
						if (param_type == 'WINSIZE') {
							ischanged_winsize	= true;
						}
						if (param_type == 'CONTENTS') {
							ischanged_contents	= true;
						}
						if (param_type == 'APPERANCE') {
							ischanged_apperance	= true;
						}
						if (param_type == 'WORDING') {
							ischanged_wording	= true;
						}
						break;
					}
				}
			} else {
				let str_log	= 'key[' + key + '], not exist'
				console.log(str_log);
				alert(str_log);
			}
		}
		if (ischanged_winsize) {
			this.SizeChanged();
		}
		if (ischanged_contents || ischanged_apperance || ischanged_wording) {
			this.AppearrenceChanged();
		}
	}

	InitOptions() {
		this.options	= {};
		var params		= CandisCommon.option_params;
		var params_add	= this.GetOptionParams();
		params			= params.concat(params_add);
		for (var param of params) {
			var key		= param[1];
			var defval	= param[2];
			this.options[key]	= defval;
		}
	}
	MakeWording(key, params=[]) {
		var str_wording		= this.options[key];
		for (var paramkey in params) {
			var paramvalue	= params[paramkey];
			str_wording		= this.Replace1Param(str_wording, paramkey, paramvalue);
		}
		return str_wording;
	}
	Replace1Param(str_wording, paramkey, paramvalue) {
		var str_target		= '{{' + paramkey + '}}';
		if (str_wording.indexOf(str_target) == -1) {
			console.log(paramkey, '(paramkey) not in', str_wording, 'str_wording');
			return;
		}
		str_wording			= str_wording.replace(str_target, paramvalue);
		return str_wording;
	}

	KeyDownTimeInput_LR(prefix, st_end, h_m, key_upper, notmove_thenedge) {
		var result		= {};
		result.edge_detect	= 0;
		if (key_upper == 'ARROWLEFT' && st_end == 'start' && h_m == 'h') {
			result.edge_detect	-= 1;
		} else if (key_upper == 'ARROWRIGHT' && st_end == 'end' && h_m == 'm') {
			result.edge_detect	+= 1;
		}

		if ((key_upper == 'ARROWLEFT' && h_m == 'h') ||
			(key_upper == 'ARROWRIGHT' && h_m == 'm')) {
			st_end	= (st_end == 'start') ? 'end' : 'start' ;
		}

		h_m	= (h_m == 'h') ? 'm' : 'h' ;

		if (notmove_thenedge && result.edge_detect != 0) {
			result.id_new	= st_end + '_' + h_m;
		} else {
			result.id_new	= prefix + st_end + '_' + h_m;
			$(result.id_new).focus();
		}
		console.log('result=', result);
		return result;
	}

	Get1stCandiInfo() {
		var info	= {};
		info.candi	= null;
		info.dtd	= null;
		for (var candi of this.candis) {
			var dtd_candi	= new Date(candi.dt_start.getFullYear(), candi.dt_start.getMonth(), candi.dt_start.getDate());
			if (info.dtd	== null || dtd_candi < info.dtd) {
				info.dtd	= dtd_candi;
				info.candi	= candi;
			}
		}
		if (info.dtd	== null) {
			var dt_target	= new Date();
			info.dtd	= new Date(dt_target.getFullYear(), dt_target.getMonth(), dt_target.getDate());
		}
		return info;
	}

	SetEditingCandi(no) {
		var candi_target	= null;
		for (var candi of this.candis) {
			if (candi.no == no) {
				candi_target	= candi;
				candi.editing	= true;
			} else {
				candi.editing	= false;
			}
		}
		if (candi_target == null) {
			console.log('candi_target == null');
			return;
		}
		this.MoveDay(candi_target.dt_start);
		this.DrawCandis();
	}

}




/**
 * MakeCandis class
 * 
 */
class MakeCandis extends CandisCommon {
	static option_params	= [
		['WORDING',		'title_newcandi',		'新候補日時'],
		['WORDING',		'title_explanation',	'ショートカット'],
		['WORDING',		'ope_all',				'※ Shift+⇅:エリア移動、⇅:時間操作、↔:時間欄移動、(候補日時) Ctrl+e:編集、Ctrl+d:削除、Ctrl+c:新時間枠作成、(新候補日時)Ctrl+a:追加、 Esc:キャンセル'],
		['WORDING',		'warning_conflict',		'候補{{candi_no1}}と候補{{candi_no2}}の時間が重なってます'],
	];

	/**
	 * constructor, for 
	 * @param {string} div_drawarea 
	 * @param {function} cb_change 
	 */
	constructor(div_drawarea, cb_change) {
		super();
		this.div_drawarea		= div_drawarea;
		this.cb_change			= cb_change;
		this.focusarea			= 'FOCUSAREA_TITLE';
		this.newwaku_visible	= false;
		this.candis				= [];
		this.candis_warning		= '';
		this.InitOptions();
		this.title				= '';
		this.min_needtime		= this.options.min_needtime;
		this.InitDraw();
	}

	SetSchedules(candis, exists, title, min_needtime=null) {
		this.candis			= candis;
		this.exists			= exists;
		this.title			= title;
		this.min_needtime	= (min_needtime==null) ? this.options.min_needtime : min_needtime;
		this.SortCandis();
		var info	= this.Get1stCandiInfo();
		if (info.candi != null) {
			info.candi.editing	= true;
		}
		this.DrawCandis();
		if (this.candis.length == 0) {
			this.ChangeFocusArea('FOCUSAREA_TITLE');
		} else {
			this.ChangeFocusArea('FOCUSAREA_CANDILIST');
		}
		this.DrawExistCalendar();
		this.MoveDay(info.dtd);
	}

	InitOptions() {
		super.InitOptions();
	}

	GetOptionParams() {
		return MakeCandis.option_params;
	}

	ChangeFocusArea(focusarea, nodraw=false) {
		var prev_area	= this.focusarea;
		var areas		= ['FOCUSAREA_TITLE', 'FOCUSAREA_NEEDTIME', 'FOCUSAREA_CANDILIST', 'FOCUSAREA_NEWCANDI'];
		var pos_prev	= areas.indexOf(prev_area);
		var pos_new		= areas.indexOf(focusarea);
		if (pos_new - pos_prev == 1 || (pos_new == 0 && pos_prev == 3)) {
			var move	= 1;
		} else {
			var move	= -1;
		}
		if (this.newwaku_visible == false) {
			areas.splice(3, 1);
		}
		if (this.candis.length == 0) {
			areas.splice(2, 1);
		}
		var pos_new_exist	= areas.indexOf(focusarea);
		if (pos_new_exist == -1) {
			pos_new_exist	= pos_prev + move;
			if (pos_new_exist < 0) {
				pos_new_exist	= areas.length - 1;
			}
			if (areas.length <= pos_new_exist) {
				pos_new_exist	= 0;
			}
		}
		var area	= areas[pos_new_exist];
		this.focusarea	= area;
		if (area == 'FOCUSAREA_TITLE') {
			this.id_to_focus	= '#id_textarea_title';
		} else if (area == 'FOCUSAREA_NEEDTIME') {
			this.id_to_focus	= '#id_min_needtime';
		} else if (area == 'FOCUSAREA_CANDILIST') {
			this.id_to_focus	= '#id_keydown_receiver';
		} else if (area == 'FOCUSAREA_NEWCANDI') {
			this.id_to_focus	= '#id_new_date';
		}
		if (!nodraw) {
			this.DrawCandis();
		}
	}

	InitDraw() {
		console.log('InitDraw')
		this.CreateParentArea();
		this.CreateCandisArea();
		this.CreateCalendarsArea();
		this.SizeChanged();
	}

	AppearrenceChanged() {
		if (this.candis != null) {
			this.DrawCandis();
		}
		for (var candi of this.candis) {
			candi.title	= this.MakeWording('candititle', {'candi_no' : candi.no});
		}
		this.DrawExistCalendar();
	}

	SizeChanged() {
		console.log('SizeChanged');
		this.widths		= this.CalcWidths();
		this.heights	= this.CalcHeights();
		this.DrawSetWidths();
		this.DrawSetHeight();
		this.DrawCandis();
		this.DrawExistCalendar();
		this.cal_exists.render();
	}

	OP_Window_Focus() {
		this.FocusArea();	
	}

	// .id_textarea_title 
	OP_ClickTitle(e) {
		this.ChangeFocusArea('FOCUSAREA_TITLE');
	}

	// #id_textarea_title
	OP_KeyDownTitle(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		this.ChangeFocusArea('FOCUSAREA_TITLE', true);
		if (!e.altKey && e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Shift)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.Keydown_ModeChange(e, key_upper);
			}
		}
	}

	// #id_textarea_title
	OP_KeyUpTitle(e) {
		if (this.timer_id != null) {
			clearTimeout(this.timer_id);
		}
		var str_title	= $('#id_textarea_title').val();
		this.title		= str_title;
		var app	= this;
		this.timer_id	= setTimeout(
			function CB() {
				app.CB_Timeout_Keyup(); 
			}
			, 500
		);
	}
	CB_Timeout_Keyup() {
		this.timer_id	= null;
		this.cb_change(this.candis, this.title, this.min_needtime);
	}

	// #id_textarea_title .cls_needtime #id_keydown_receiver #id_new_date 
	Keydown_ModeChange(e, key_upper) {
		var id_modes	= [
			['id_textarea_title',		'FOCUSAREA_TITLE'],
			['id_min_needtime', 		'FOCUSAREA_NEEDTIME'],
			['id_keydown_receiver',		'FOCUSAREA_CANDILIST'],
			['id_new_date',				'FOCUSAREA_NEWCANDI'],
		];
		var id_target	= $(e.target).attr('id');
		var pos			= -1;
		for (pos = 0; pos < id_modes.length; pos++) {
			var id_mode	= id_modes[pos];
			if (id_mode[0] == id_target) {
				break;
			}
		}
		if (key_upper == 'ARROWUP') {
			var pos_new	= pos - 1;
			if (pos_new < 0) {
				pos_new	= id_modes.length - 1;
			}
		} else {
			var pos_new	= pos + 1;
			if (id_modes.length <= pos_new) {
				pos_new	= 0;
			}
		}
		var mode	= id_modes[pos_new][1];
		this.ChangeFocusArea(mode);
	}

	// .cls_needtime 
	OP_ClickNeedMinInput(e) {
		var id_this		= $(e.target).attr('id');
		if (id_this == 'id_min_needtime') {
			this.ChangeFocusArea('FOCUSAREA_NEEDTIME');
		}
	}

	// .cls_needtime
	OP_KeyDownNeedMinInput(e) {
		var key_upper	= e.key.toUpperCase();
		var id_this		= $(e.target).attr('id');
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		this.ChangeFocusArea('FOCUSAREA_NEEDTIME', true);
		if (!e.altKey && e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Shift)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.Keydown_ModeChange(e, key_upper);
			}
		}
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			console.log('key_upper(Ctrl)=', key_upper);
			if (key_upper == 'C') {
				e.preventDefault();
				this.Keydown_CandiList_CreateNew();
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Only)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				var value	= EleValueChange_ByUpDown('#' + id_this, 0, 120, 5, false, key_upper);
				this.min_needtime	= value;
				this.CandisUpdated();
			}
		}
	}

	// .td_candi_info
	OP_ClickCandi(e) {
		var jq_tr		= $(e.target).parent();
		var candi_id	= jq_tr.attr('id');
		for (var candi of this.candis) {
			if ('candi_' + candi.no == candi_id) {
				this.SetEditingCandi(candi.no);
				break;
			}
		}
		this.ChangeFocusArea('FOCUSAREA_CANDILIST', true);
	}

	// #id_keydown_receiver
	OP_CandiList_Keydown(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		if (!e.altKey && e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Shift)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.Keydown_ModeChange(e, key_upper);
			}
		}
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			console.log('key_upper(Ctrl)=', key_upper);
			if (['D', 'C', 'E'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (key_upper == 'D') {
				this.Keydown_CandiList_Del();
			} else if (key_upper == 'C') {
				this.Keydown_CandiList_CreateNew();
			} else if (key_upper == 'E') {
				this.Keydown_CandiList_Edit();
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			console.log('key_upper=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.Keydown_CandiList_UD(key_upper);
			}
		}
	}

	Keydown_CandiList_UD(key_upper) {
		var editing		= this.GetEditingCandi;
		var no			= editing.candi.no;
		if (key_upper == 'ARROWUP') {						// ↑
			no	-= 1;
		} else if (key_upper == 'ARROWDOWN') {				// ↓
			no	+= 1;
		}
		if (no < 1) {
			no	= editing.candicount;
		}
		if (editing.candicount < no) {
			no	= 1;
		}
		this.SetEditingCandi(no);
	}

	Keydown_CandiList_Del() {
		var editing		= this.GetEditingCandi;
		var no			= editing.candi.no;
		this.DelCandi(no);
	}

	Keydown_CandiList_Edit() {
		var editing		= this.GetEditingCandi;
		var no			= editing.candi.no;
		this.DelCandi(no);
		this.AddNewWaku(editing.candi.dt_start, editing.candi.dt_end);
	}

	Keydown_CandiList_CreateNew() {
		this.OP_AddNewWaku();
	}

	// .btn_kirari
	OP_ClickBtn_CandiList(e) {
		console.log('OP_ClickBtn_CandiList, e=', e);
		var id_btn		= $(e.target).attr('id');
		if (id_btn == 'id_btn_del') {
			var el_tr		= $(e.target).parent().parent();
			var candi_id	= el_tr.attr('id');
			var no	= candi_id.replace('candi_', '');
			no		= parseInt(no);
			this.DelCandi(no);
		} else if (id_btn == 'id_btn_add') {
			this.OP_AddNewWaku();
		}
		this.RedrawCandis2Calendar();
	}

	OP_AddNewWaku() {
		var editing		= this.GetEditingCandi;
		console.log(editing);
		if (editing.candicount == 0) {
			var dt_start	= new Date();
			var i_week		= dt_start.getDay();
			if (i_week == 0) {
				dt_start.setDate(dt_start.getDate() + 1);
			} else if (i_week == 6) {
				dt_start.setDate(dt_start.getDate() + 2);
			}
			dt_start.setHours(this.options.starthour);
			dt_start.setMinutes(0);
			dt_start.setSeconds(0);
		} else {
			var candi		= editing.candi;
			var dt_start	= candi.dt_end;
		}
		var dt_end		= new Date(dt_start);
		dt_end.setMinutes(dt_end.getMinutes() + this.options.min_needtime);
		this.AddNewWaku(dt_start, dt_end);
	}

	AddNewWaku(dt_start, dt_end) {
		this.DrawNewCandiHtml(dt_start, dt_end);
		this.RedrawCandis2Calendar();
	}

	// .btn_kirari_small
	OP_ClickBtn_NewCandi(e) {
		console.log('OP_ClickBtn_NewCandi, e=', e);
		var id_btn		= $(e.target).attr('id');
		if (id_btn == 'id_btn_save') {
			this.KeyDownDateTimeInput_SaveNew();
		} else if (id_btn == 'id_btn_cancel') {
			this.KeyDownDateTimeInput_Cancel();
		}
	}

	// .cls_timeinput 
	OP_KeyDownDateTimeInput(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		if (!e.altKey && e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Shift)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.Keydown_ModeChange(e, key_upper);
			}
		}
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			console.log('key_upper(Control)=', key_upper);
			if (key_upper == 'A') {
				e.preventDefault();
				this.KeyDownDateTimeInput_SaveNew();
			} else if (key_upper == 'ESCAPE') {
				e.preventDefault();
				this.KeyDownDateTimeInput_Cancel();
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Only)=', key_upper);
			if (key_upper == 'ESCAPE') {
				e.preventDefault();
				this.KeyDownDateTimeInput_Cancel();
				return;
			}

			var id_this		= $(e.target).attr('id');
			if (id_this == 'id_new_date') {
				this.KeyDownNewDateInput(e, key_upper);
			} else  {
				this.KeyDownNewTimeInput(e, key_upper, id_this);
			}
		}
	}

	KeyDownNewDateInput(e, key_upper) {
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if (key_upper == 'ARROWLEFT') {
				this.id_to_focus	= '#id_new_end_m';
				$(this.id_to_focus).focus();
			} else if (key_upper == 'ARROWRIGHT') {
				this.id_to_focus	= '#id_new_start_h';
				$(this.id_to_focus).focus();
			} else if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				var dtd_new = EleValueChange_ByUpDown_Date(this.dtd_newcandi, key_upper, this.options.func_date2str, '#id_new_date');
				this.dtd_newcandi	= dtd_new;
				this.RedrawCandis2Calendar();
			}
		}
	}

	KeyDownNewTimeInput(e, key_upper, id_this) {
		var str_params	= id_this.replace('id_new_', '');
		var params		= str_params.split('_');
		var st_end		= params[0];
		var h_m			= params[1];

		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if (['ARROWLEFT', 'ARROWRIGHT'].indexOf(key_upper) != -1) {
				var result	= super.KeyDownTimeInput_LR('#id_new_', st_end, h_m, key_upper, true);
				if (result.edge_detect == -1 || result.edge_detect == 1) {
					this.id_to_focus	= '#id_new_date';
					$(this.id_to_focus).focus();
				} else {
					this.id_to_focus	= result.id_new;
				}	
			} else if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				EleValueChange_ByUpDown_HourMin('#id_new_', st_end, h_m, key_upper);
				this.RedrawCandis2Calendar();
			}
		}
	}

	KeyDownDateTimeInput_SaveNew() {
		var newcandi	= this.MakeNewCandiFromEl();
		this.AddNewCandi(newcandi);
	}

	AddNewCandi(newcandi) {
		this.candis.push(newcandi);
		this.SortCandis();
		this.ClearNewCandiHtml();
		this.ChangeFocusArea('FOCUSAREA_CANDILIST');
		this.CandisUpdated();
	}

	MakeNewCandiFromEl() {
		var newcandi	= {};
		newcandi.dt_start	= new Date(this.dtd_newcandi);
		newcandi.dt_end		= new Date(this.dtd_newcandi);
		newcandi.dt_start.setHours(GetValueFromEle('#id_new_start_h'));
		newcandi.dt_start.setMinutes(GetValueFromEle('#id_new_start_m'));
		newcandi.dt_end.setHours(GetValueFromEle('#id_new_end_h'));
		newcandi.dt_end.setMinutes(GetValueFromEle('#id_new_end_m'));
		return newcandi;
	}

	KeyDownDateTimeInput_Cancel() {
		this.ClearNewCandiHtml();
		this.RedrawCandis2Calendar();
		this.ChangeFocusArea('FOCUSAREA_CANDILIST');
	}

	OP_EventMouseEnter(info) {
		console.log('OP_EventMouseEnter, info', info);	
	}

	OP_EventMouseLeave(info) {
		console.log('OP_EventMouseLeave, info', info);	
	}

	OP_EventClick(sche_clicked) {
		window.open(sche_clicked.url);
	}

	OP_SpanSelect(dt_start, dt_end) {
		this.cal_exists.unselect();
		var diff	= dt_end - dt_start;
		diff		/= (60 * 1000);
		if (diff < this.min_needtime) {
			var str_wording	= this.MakeWording('needtime_shortage', {'needtime':this.min_needtime})
			alert(str_wording);
			return;
		}
		//this.AddNewWaku(dt_start, dt_end);
		var newcandi	= {}
		newcandi.dt_start	= dt_start;
		newcandi.dt_end		= dt_end;
		this.AddNewCandi(newcandi);

	}

	FocusArea() {
		if (this.id_to_focus == null) {
			return;
		}
		setTimeout(() => {
			$(this.id_to_focus).focus();
			console.log('this.id_to_focus=', this.id_to_focus);
		}, (100));
	}

	DelCandi(no) {
		this.candis.splice(no-1, 1);
		this.SortCandis();
		this.CandisUpdated();
	}

	SortCandis() {
		this.candis.sort(CB_SortDtStart);
		var no	= 1
		for (var candi of this.candis) {
			candi.no		= no;
			candi.title		= this.MakeWording('candititle', {'candi_no' : no});
			candi.editing	= false;
			if (no == 1) {
				candi.editing	= true;
			}
			if (candi.status == null) {
				candi.status	= 'CANDI_STS_UNKNOWN';
				candi.comment	= '';
				if (candi.oks == null) {
					candi.oks	= [];
				}
			}
			no	+= 1
		}
	}

	CandisUpdated() {
		this.UpdateWarning();
		this.DrawCandis();
		this.RedrawCandis2Calendar();
		this.cb_change(this.candis, this.title, this.min_needtime);
	}

	UpdateWarning() {
		this.candis_warning	= '';
		for (var i = 0; i < this.candis.length - 1; i++) {
			var candi1	= this.candis[i];
			for (var j = i+1; j < this.candis.length; j++) {
				var candi2	= this.candis[j];
				console.log(candi1, ' < ', candi2);
				if (candi2.dt_start < candi1.dt_end) {
					this.candis_warning	= this.MakeWording('warning_conflict', {'candi_no1':candi1.no, 'candi_no2':candi2.no});
					return ;
				}
			}
		}
		for (var candi of this.candis) {
			var diff	= candi.dt_end - candi.dt_start;
			diff		/= (60 * 1000);
			if (diff < this.min_needtime) {
				this.candis_warning	= this.MakeWording('nt_shortage_title', {'candi_no':candi.no, 'needtime':this.min_needtime});
				return;
			}
		}
	}

	SetNewCandiCb() {
		var app	= this;
		$('#id_textarea_title').off('click');
		$('#id_textarea_title').on('click',
			function (e) {
				app.OP_ClickTitle(e);
			}
		)

		$('#id_textarea_title').off('keydown');
		$('#id_textarea_title').on('keydown',
			function (e) {
				app.OP_KeyDownTitle(e);
			}
		)

		$('#id_textarea_title').off('keyup');
		$('#id_textarea_title').on('keyup',
			function(e) {
				app.OP_KeyUpTitle(e);
			}
		)

		$('.cls_needtime').off('click');
		$('.cls_needtime').on('click',
			function (e) {
				app.OP_ClickNeedMinInput(e);
			}
		)

		$('.cls_needtime').off('keydown');
		$('.cls_needtime').on('keydown',
			function (e) {
				app.OP_KeyDownNeedMinInput(e);
			}
		)

		$('.td_candi_info').off('click');
		$('.td_candi_info').on('click',
			function (e) {
				app.OP_ClickCandi(e);
			}
		)

		$('.btn_kirari').off('click');
		$('.btn_kirari').on('click',
			function (e) {
				app.OP_ClickBtn_CandiList(e);
			}
		)

		$('#id_keydown_receiver').off('keydown');
			$('#id_keydown_receiver').on('keydown',
			function (e) {
				app.OP_CandiList_Keydown(e);
			}
		)

		$('.cls_timeinput').off('keydown');
		$('.cls_timeinput').on('keydown',
			function (e) {
				app.OP_KeyDownDateTimeInput(e);
			}
		)

		$('.btn_kirari_small').off('click');
		$('.btn_kirari_small').on('click',
			function (e) {
				app.OP_ClickBtn_NewCandi(e);
			}
		)

	}

	CreateParentArea() {
		$(this.div_drawarea).html('');
		var dom_parent	= '<table border="0" id="id_parent_tbl"><tr><td id="id_td_left" style="vertical-align:top; border:none;"></td>'
		dom_parent		+= '<td id="id_td_right" style="border:none;"></td></tr></table>'
		$(this.div_drawarea).append(dom_parent);
	}

	CreateCandisArea() {
		var dom_left	= '<div class="candiboxes_area" id="id_candis_area"></div>'
		$('#id_td_right').append(dom_left)

		$('#id_candis_area').html('');
		var html_candis	= '<div class="candiboxes_body">';
		html_candis		+= '<table><tr><td id="id_td_candi_area">';
		html_candis		+= '<input type="text" id="id_keydown_receiver" readonly>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_candititle"></table>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_candineedmin"></table>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_candilist"></table>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_newcandi"></table>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_explanation"></table>';
		html_candis		+= '</td></tr></table>';
		html_candis		+= '</div>';
		$('#id_candis_area').append(html_candis);
	}
		
	CreateCalendarsArea() {
		var dom_right	= '<table border="" id="id_left_tbl"><tr>'
		var dom_cal		= '<div class="cls_calendar_area"><div class="cls_calendar_body" id="'
		dom_right		+= '<td class="cls_td_calendar">' + dom_cal + CandisCommon.CALID_EXISTS + '"></div></div></td>'
		dom_right		+= '</tr></table>'
		$('#id_td_left').append(dom_right)

		var el_cal_exists	= $('#' + CandisCommon.CALID_EXISTS)[0]
		var cal_exists		= new FullCalendar.Calendar(el_cal_exists, GetCalParams_MakeCandis(this));
		cal_exists.render();

		this.cal_exists		= cal_exists;
	}

	CalcWidths() {
		var width_all	= this.options.width;
		var widths		= {};
		widths.all		= width_all;
		widths.right	= parseInt(width_all * 2.5 / 10);
		var min_right	= 400;
		if (widths.right < min_right) {
			widths.right = min_right;
		}
		const margin_right	= 10;
		widths.left			= parseInt(width_all - widths.right - margin_right);
		widths.exists		= parseInt(widths.left * 9.9 / 10);

		const margin_candi	= 10;
		widths.candi_all	= widths.right - margin_candi;
		widths.needtime_title	= parseInt(widths.candi_all * 6.5 / 10);
		widths.needtime_value	= parseInt(widths.candi_all * 3.5 / 10);
		widths.candi_no		= parseInt(widths.candi_all * 2 / 10);
		widths.candi_dt		= parseInt(widths.candi_all * 5.9 / 10);
		widths.candi_btn	= parseInt(widths.candi_all * 2 / 10);
		console.log('[width]all/left/right/exists/candi_all/no/dt/btn=', widths.all, widths.left, widths.right, widths.exists, widths.candi_all, widths.candi_no, widths.candi_dt, widths.candi_btn);
		return widths;
	}

	CalcHeights() {
		var height_all	= this.options.height;
		var heights		= {};
		heights.title			= 40;
		heights.candis_area		= height_all;
		heights.calendarbody	= height_all - heights.title;
		console.log('[heights]all/candis_area/calendarbody=', height_all, heights.candis_area, heights.calendarbody);
		return heights;
	}

	DrawSetWidths() {
		var widths		= this.widths;
		$('#id_parent_tbl').css('width', widths.width_all);
		$('#id_td_left').css('width', widths.left);
		$('#id_right_tbl').css('width', widths.right);
		var jq_td_exists	= $('#' + CandisCommon.CALID_EXISTS).parent().parent();
		//var jq_td_selects	= $('#' + CandisCommon.CALID_SELECTS).parent().parent();
		jq_td_exists.css('width', widths.exists);
		//jq_td_selects.css('width', widths.selects);
	}

	DrawSetHeight() {
		var heights			= this.heights;
		var jq_td_calendar	= $('.cls_td_calendar');
		jq_td_calendar.css('height', '' + (heights.calendarbody) + 'px');
		$('#id_candis_area').css('height', '' + (heights.candis_area) + 'px');
	}

	DrawCandis() {
		console.log('DrawCandis');
		var htmls	= this.MakeHtml_CandisInfo();
		$('#id_tbl_candititle').html(htmls.header);
		$('#id_tbl_candineedmin').html(htmls.needmin);
		$('#id_tbl_candilist').html(htmls.candilist);
		$('#id_tbl_newcandi').html(htmls.newcandi);
		$('#id_tbl_explanation').html(htmls.explanation);
		this.SetNewCandiCb();
		this.FocusArea();
	}

	DrawExistCalendar() {
		if (!this.exists) {
			return;
		}
		this.cal_exists.removeAllEvents();
		for (var exist of this.exists) {
			var event	= {}
			event.title		= exist.title;
			event.start		= exist.dt_start.toISOString();
			event.end		= exist.dt_end.toISOString();
			event.color		= this.options.event_color_exist;
			exist.orgtype	= 'exist';
			event.org		= exist;
			if (exist.dt_start.getHours() == 0 && exist.dt_start.getMinutes() == 0) {
				event.allDay	= true;
			}
			this.cal_exists.addEvent(event);
		}
		this.AddCandis2Calendar();
	}

	AddCandis2Calendar() {
		for (var candi of this.candis) {
			var event	= {}
			event.title		= candi.title;
			event.start		= candi.dt_start.toISOString();
			event.end		= candi.dt_end.toISOString();
			event.color		= this.options.event_color_candi;
			event.display	= 'background';
			candi.orgtype	= 'candi';
			event.org		= candi;
			this.cal_exists.addEvent(event);
		}
		if (this.newwaku_visible) {
			var newcandi	= this.MakeNewCandiFromEl();
			var event	= {}
			event.title		= 'Adding';
			event.start		= newcandi.dt_start.toISOString();
			event.end		= newcandi.dt_end.toISOString();
			event.color		= this.options.event_color_newcandi;
			event.display	= 'background';
			newcandi.orgtype	= 'candi';
			event.org		= newcandi;
			this.cal_exists.addEvent(event);

		}
	}

	RedrawCandis2Calendar() {
		var events	= this.cal_exists.getEvents();
		for (var event of events) {
			var sche	= event._def.extendedProps.org;
			if (sche.orgtype == 'candi') {
				event.remove();
			}
		}
		this.AddCandis2Calendar();
	}

	MoveDay(dtd) {
		if (this.dtd_cal && this.dtd_cal.getMonth() == dtd.getMonth() && this.dtd_cal.getDate() == dtd.getDate()) {
			return;
		}
		this.dtd_cal	= dtd;
		this.cal_exists.gotoDate(dtd);
	}
	
	DrawNewCandiHtml(dt_start, dt_end) {
		if (dt_start.getHours() == 0) {
			dt_start.setHours(9);
			dt_start.setMinutes(0);
			dt_end	= new Date(dt_start);
			dt_end.setHours(10);
		}
		this.newwaku_visible	= true;
		this.newccandi		= {'dt_start':dt_start, 'dt_end':dt_end}
		var html_newcandi	= this.MakeHtml_NewCandi();
		$('#id_tbl_newcandi').html(html_newcandi);
		this.SetNewCandiCb();
		this.dtd_newcandi	= new Date(dt_start);
		this.ChangeFocusArea('FOCUSAREA_NEWCANDI');
	}

	ClearNewCandiHtml() {
		this.newwaku_visible	= false;
		$('#id_tbl_newcandi').html('');
	}

	MakeHtml_CandisInfo() {
		var htmls		= {'header':'', 'needmin':'', 'candilist':'', 'newcandi':''};
		htmls.header		= this.MakeHtml_CandiHeader();
		htmls.needmin		= this.MakeHtml_Needtime();
		htmls.candilist		= this.MakeHtml_CandiList();
		htmls.explanation	= this.MakeHtml_Explanation();
		htmls.newcandi		= this.MakeHtml_NewCandi();
		return htmls;
	}

	MakeHtml_CandiHeader() {
		var widths		= this.widths;
		var css_hd		= ' style="background-color:' + this.options.title_color + '; ';
		var html_candis	= '';
		var title_schedule	= this.MakeWording('title_schedule');
		html_candis		+= '<tr><th colspan=2' + css_hd + 'width:'+ widths.candi_all + 'px;">' + title_schedule + '</th></tr>'
		var html_text	= '<textarea id="id_textarea_title" style="width:' + (widths.candi_all - 30) + 'px; height:20px;">' + this.title + '</textarea>';
		html_candis		+= '<tr><td colspan=2 style="width:' + widths.candi_all + 'px;">' + html_text + '</td></tr>';
		return html_candis
	}

	MakeHtml_Needtime() {
		var widths		= this.widths;
		var css_hd		= ' style="background-color:' + this.options.title_color + '; ';

		var html_candis	= '';
		var title_needtime	= this.MakeWording('title_needtime');
		html_candis		+= '<tr><th' + css_hd + 'width:'+ widths.needtime_title + 'px;">' + title_needtime + '</th>'
		html_candis		+= '<td style="width:' + widths.needtime_value + 'px;" align="center">';
		html_candis		+= '<input readonly class="cls_needtime" id="id_min_needtime" value="' + this.min_needtime + '"></input>';
		html_candis		+= '</td></tr>';
		return html_candis
	}

	MakeHtml_CandiList() {
		var widths			= this.widths;
		var css_hd			= ' style="background-color:' + this.options.title_color + '; ';
		css_hd				+= 'width:' + widths.candi_all + 'px; ';
		var html_candis		= '';
		html_candis			+= '<tr style="height:15px;"><td colspan="3"></td></tr>';
		var title_candi		= this.MakeWording('title_candi');
		html_candis			+= '<tr><th' + css_hd + '" align="center" colspan=3>' + title_candi + '</th>'
		html_candis			+= '</tr>';
		for (var candi of this.candis) {
			html_candis		+= this.MakeHtml_1CandiInfo(candi);
		}
		if (this.candis_warning != '') {
			html_candis		+= '<tr><td colspan="3" style="width:' + (widths.candi_all) + 'px; color:red;">' + this.candis_warning +  '</td></tr>';;
		}
		return html_candis;
	}

	MakeHtml_1CandiInfo(candi) {
		var widths		= this.widths;
		var html_candi	= '';
		var show_waku	= (candi.editing && this.focusarea == 'FOCUSAREA_CANDILIST') ? true : false;
		var html_edit_tr	= (show_waku) ? 'class="cls_editing"' : '';
		var html_edit_left	= (show_waku) ? ' cls_td_mostleft ' : '';
		var html_edit_right	= (show_waku) ? ' cls_td_mostright ' : '';
		html_candi		+= '<tr ' + html_edit_tr + ' id="candi_' + candi.no + '">';
		var candititle	= this.MakeWording('candititle', {'candi_no' : candi.no});
		html_candi		+= '<td class="td_candi_info + ' + html_edit_left + '" style="width:' + widths.candi_no + 'px">' + candititle + '</td>';
		var str_dt		= this.options.func_date2str(candi.dt_start) + ' ' + GetTmStr(candi.dt_start) + '～' + GetTmStr(candi.dt_end)
		html_candi		+= '<td class="td_candi_info" style="width:' + widths.candi_dt + 'px">' + str_dt + '</td>';
		var btn			= '<a href="javascript:void(0);" class="btn_kirari btn_kirari_red" id="id_btn_del">Del</a>';
		html_candi		+= '<td class="td_candi_info2 ' + html_edit_right + '" style="width:' + widths.candi_btn + 'px">' + btn + '</td>';
		html_candi		+= '</tr>';
		return html_candi;

	}

	MakeHtml_NewCandi() {
		var html_newcandi	= '';
		var widths		= this.widths;
		var css_hd		= ' style="background-color:' + this.options.title_color + '; ';
		var title_newcandi	= this.MakeWording('title_newcandi');
		html_newcandi	+= '<tr style="height:15px;"><td colspan="3"></td></tr>';
		html_newcandi	+= '<tr><th colspan=3' + css_hd + 'width:'+ (widths.candi_all-10) + 'px;">' + title_newcandi + '</th></tr>';
		if (!this.newwaku_visible) {
			var btn			= '<a href="javascript:void(0);" class="btn_kirari btn_kirari_blue" id="id_btn_add" style="width:150px;">枠作成</a>';
			html_newcandi	+= '<tr><td colspan="3" class="td_candi_info2 " style="width:' + (widths.candi_all) + 'px">' + btn + '</td></tr>';
			return html_newcandi;
		}
		var str_date	= this.options.func_date2str(this.newccandi.dt_start) + ' ';
		var id_new	= 'id_new_';
		html_newcandi	+= '<tr id="newcandi">';
		html_newcandi	+= '<td class="td_candi_info2" style="width:' + (widths.candi_dt) + 'px">';
		html_newcandi	+= '<input readonly style="width:75px;" class="cls_timeinput" id="' + id_new + 'date" value="' + str_date + '"></input>';
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'start_h" value="' + this.newccandi.dt_start.getHours() + '"></input>';
		html_newcandi	+= '<label class="cls_timeinput">:</label>'
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'start_m" value="' + MinStr(this.newccandi.dt_start) + '"></input>';
		html_newcandi	+= '<label class="cls_timeinput">～</label>'
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'end_h" value="' + this.newccandi.dt_end.getHours() + '"></input>';
		html_newcandi	+= '<label class="cls_timeinput">:</label>'
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'end_m" value="' + MinStr(this.newccandi.dt_end) + '"></input>';
		html_newcandi	+= '</td>';
		html_newcandi	+= '<td class="td_candi_info2 cls_td_add_cancel" style="width:' + (widths.candi_btn/2) + 'px">';
		html_newcandi	+= '<a href="javascript:void(0);" class="btn_kirari_small btn_kirari_blue" id="id_btn_save">Add</a></td>';
		html_newcandi	+= '<td class="td_candi_info2 cls_td_add_cancel" style="width:' + (widths.candi_btn/2) + 'px">';
		html_newcandi	+= '<a href="javascript:void(0);" class="btn_kirari_small btn_kirari_red" id="id_btn_cancel">×</a></td>';
		html_newcandi	+= '</tr>'
		return html_newcandi;
	}

	MakeHtml_Explanation() {
		var html_ex	= '';
		var widths		= this.widths;
		var css_hd		= ' style="background-color:' + this.options.title_color + '; ';
		css_hd			+= 'width:' + widths.candi_all + 'px; ';
		var title_explanation	= this.MakeWording('title_explanation');
		var widths		= this.widths;
		html_ex	+= '<tr style="height:15px;"><td colspan="3"></td></tr>';
		html_ex	+= '<tr><th' + css_hd + 'width:'+ (widths.candi_all-10) + 'px;">' + title_explanation + '</th></tr>';
		var ope_all	= this.MakeWording('ope_all');
		html_ex	+= '<tr><td>' + ope_all + '</td></tr>';
		return html_ex;
	}
}




class SeleCandis extends CandisCommon {
	static option_params	= [
		['WORDING',		'outof_canditime',		'候補日時をはみ出しています'],
		['WORDING',		'merge_confirm',		'既存のOK時間と隣接していますが、マージしますか？'],
		['WORDING',		'conf_needtime',		'必要な時間({{needtime}}分)未満の選択です。 候補全体({{time_start}}～{{time_end}})をOK登録しますか？'],
		['WORDING',		'needtime',				'{{needtime}}分'],
		['WORDING',		'title_status',			'ステータス'],
		['WORDING',		'title_detail',			'回答詳細'],
		['WORDING',		'title_1touch',			'ワンタッチ'],
		['WORDING',		'detail_description',	'{{time_start}}～{{time_end}}はOK'],
		['WORDING',		'detail_allok',			'左記時間OK'],
		['WORDING',		'title_detail_area',	'候補{{candi_no}} [{{date}} {{time_start}}～{{time_end}}] の回答詳細'],
		['WORDING',		'candilist_operation',	'※ (全てShift + 各key) ⇅:上下移動、o:OK、n:NG、a:時間枠追加'],
		['WORDING',		'detail_operation',		'※ (全てCtrl + 各key) ⇅:時間操作、↔:時間欄移動、d:削除、m:1つ上の時間とマージ、c:コメント入力エリアへ移動'],
		['WORDING',		'mergeng_nottop',		'この時間が一番上です'],
		['WORDING',		'mergeng_notconti',		'マージは隣接した時間の場合のみ可能です'],
		['WORDING',		'addng_conflict',		'時間が重複しています。 (ショートカットによる追加は、候補時間の先頭に仮作成されます)'],
	];

	static WIDTH_CANDIBTNS	= 470;

	constructor(div_drawarea, cb_change) {
		super();
		this.div_drawarea	= div_drawarea;
		this.cb_change		= cb_change;
		this.InitOptions();
		this.InitDraw();
		this.SetScrollCb();
	}

	InitOptions() {
		super.InitOptions(SeleCandis.option_params);
	}

	GetOptionParams() {
		return SeleCandis.option_params;
	}

	SetSchedules(candis, exists, title, min_needtime=null) {
		this.candis			= candis;
		this.exists			= exists;
		this.title			= title;
		this.min_needtime	= (min_needtime==null) ? this.options.min_needtime : min_needtime;
		
		var no	= 1
		for (var candi of this.candis) {
			candi.no		= no;
			candi.title		= this.MakeWording('candititle', {'candi_no' : no});
			candi.editing	= false;
			if (candi.status == null) {
				candi.status	= 'CANDI_STS_UNKNOWN';
				candi.oks		= [];
				candi.comment	= '';
			}
			no	+= 1
			SortAndNumberOks(candi);
		}
		var info	= this.Get1stCandiInfo();
		if (info.candi != null) {
			info.candi.editing	= true;
		}
		this.DrawCandis();
		this.DrawSelectCalendar();
		this.DrawExistCalendar();
		this.MoveDay(info.dtd);
	}

	OP_Window_Focus() {
		this.FocusArea();	
	}

	OP_CandiList_Keydown(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		if (!e.altKey && e.shiftKey && !e.ctrlKey) {
			if (['ARROWUP', 'ARROWDOWN', 'O', 'N', 'A'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				this.Keydown_CandiList_UD(e);
			} else if (key_upper == 'O' || key_upper == 'N') {
				this.Keydown_CandiList_OkNg(e);
			} else if (key_upper == 'A') {
				this.Keydown_CandiList_AddOk(e);
			}
		}
	}

	OP_SyncScroll(jq_calendar_area_moved) {
		var jq_calendar_body	= jq_calendar_area_moved.children()
		var id_div_body_moved	= jq_calendar_body.get(0).id;

		if (id_div_body_moved == CandisCommon.CALID_EXISTS) {
			var id_div_body_target	= CandisCommon.CALID_SELECTS;
		} else {
			var id_div_body_target	= CandisCommon.CALID_EXISTS;
		}
		var jq_calendar_area_target	= $('#' + id_div_body_target).parent()
		var scroll_pos_moved	= jq_calendar_area_moved.scrollTop();
		var scroll_pos_target	= jq_calendar_area_target.scrollTop();
		if (scroll_pos_moved != scroll_pos_target) {
			console.log('Scroll, id_div_body_moved=', id_div_body_moved, ', target=', id_div_body_target + ', ' + scroll_pos_target + ' -> ' + scroll_pos_moved);
			jq_calendar_area_target.scrollTop(scroll_pos_moved);
		}
	}

	OP_SpanSelect(dt_start, dt_end) {
		var editing	= this.GetEditingCandi;
		if (editing.candicount == 0) {
			return;
		}
		var candi	= editing.candi;
		if (IsOutOfCanditime(candi, dt_start, dt_end)) {
			var str_wording	= this.MakeWording('outof_canditime');
			alert(str_wording);
			this.cal_selects.unselect();
			return;
		}
		var ok_new		= {'warning':''};
		ok_new.dt_start	= new Date(dt_start);
		ok_new.dt_end	= new Date(dt_end);
		var ms_diff		= dt_end - dt_start;
		var min_diff	= ms_diff / 1000 / 60;
		if (OverlapExist(candi, ok_new)) {
			candi.oks.push(ok_new);
			MergeOks(candi);
		} else if (min_diff < this.min_needtime) {
			var str_wording	= this.MakeWording('conf_needtime', {'needtime':this.min_needtime, 'time_start':GetTmStr(candi.dt_start), 'time_end':GetTmStr(candi.dt_end)});
			var conf_all	= confirm(str_wording);
			if (conf_all) {
				ok_new		= {'warning':''};
				ok_new.dt_start	= new Date(candi.dt_start);
				ok_new.dt_end	= new Date(candi.dt_end);
				candi.oks	= [ok_new]
			} else {
				this.cal_selects.unselect();
				return;
			}
		} else {
			candi.oks.push(ok_new);
		}
		SortAndNumberOks(candi);
		JudgeCandiStatus(candi);
		this.CandisUpdated();
	}

	OP_EventClick(sche_clicked) {
		if (sche_clicked.orgtype == 'exist') {
			window.open(sche_clicked.url);
		} else {
			for (var candi of this.candis) {
				for (var ok of candi.oks) {
					if (sche_clicked.dt_start.getTime() == ok.dt_start.getTime()) {
						this.id_to_focus	= '#id_ok_' + ok.no + '_start_h';
						this.FocusArea();
						return;
					}
				}
			}
		}
	}

	// .td_candi_info
	OP_ClickCandi(e) {
		var jq_tr		= $(e.target).parent();
		var candi_id	= jq_tr.attr('id');
		for (var candi of this.candis) {
			if ('candi_' + candi.no == candi_id) {
				this.SetEditingCandi(candi.no);
				break;
			}
		}
	}

	// .btn_kirari
	OP_ClickOneTouchEdit(e) {
		var jq_td		= $(e.target).parent();
		var jq_tr		= jq_td.parent();
		var btnid		= jq_td.attr('id');
		var candi_id	= jq_tr.attr('id');
		var type_ok		= (btnid.indexOf('ok') != -1) ? true : false ;
		console.log('candi_id=', candi_id, 'btnid=', btnid);
		for (var candi of this.candis) {
			if ('candi_' + candi.no == candi_id) {
				this.SetAllOkNg(candi.no, type_ok)
				break;
			}
		}
	}

	// .cls_timeinput 
	OP_KeyDownTimeInput(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}

		var id_this		= $(e.target).attr('id');
		var str_params	= id_this.replace('id_ok_', '');
		var params		= str_params.split('_');
		var no			= parseInt(params[0]);
		var st_end		= params[1];
		var h_m			= params[2];

		if (!e.altKey && e.shiftKey && !e.ctrlKey) {
			this.OP_CandiList_Keydown(e);
		}
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			if (['D', 'DELETE', 'M', 'C', 'ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (key_upper == 'D' || key_upper == 'DELETE') {
				this.KeyDownTimeInput_Delete(no);
			} else if (key_upper == 'M') {
				this.KeyDownTimeInput_Merge(no);
			} else if (key_upper == 'C') {
				this.KeyDownTimeInput_Move2Comment();
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if (['ARROWLEFT', 'ARROWRIGHT', 'ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (['ARROWLEFT', 'ARROWRIGHT'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.KeyDownTimeInput_LR(no, st_end, h_m, key_upper);
			} else if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.KeyDownTimeInput_UD(no, st_end, h_m, key_upper);
			}
		}
	}

	// #id_textarea_comment
	OP_KeyUpComment(e) {
		if (this.timer_id != null) {
			clearTimeout(this.timer_id);
		}
		var str_comment	= $('#id_textarea_comment').val();
		var editing		= this.GetEditingCandi;
		editing.candi.comment	= str_comment;
		var app	= this;
		this.timer_id	= setTimeout(
			function CB() {
				app.CB_Timeout_Keyup(); 
			}
			, 500
		);
	}
	CB_Timeout_Keyup() {
		this.timer_id	= null;
		this.CandisUpdated(true);
	}

	Keydown_CandiList_OkNg(e) {
		var key_upper	= e.key.toUpperCase();
		var is_ok		= (key_upper == 'O') ? true : false ; 
		var editing		= this.GetEditingCandi;
		var no			= editing.candi.no;
		this.SetAllOkNg(no, is_ok);
	}

	Keydown_CandiList_AddOk(e) {
		var editing	= this.GetEditingCandi;
		var ok_new	= {'warning':''};
		ok_new.dt_start	= new Date(editing.candi.dt_start);
		ok_new.dt_end	= new Date(ok_new.dt_start);
		ok_new.dt_end.setMinutes(ok_new.dt_end.getMinutes() + this.min_needtime);
		if (OverlapExist(editing.candi, ok_new)) {
			var str_wording	= this.MakeWording('addng_conflict');
			alert(str_wording);
			return;
		}
		editing.candi.oks.push(ok_new);
		this.CheckOkWarning();
		SortAndNumberOks(editing.candi);
		JudgeCandiStatus(editing.candi);
		this.CandisUpdated();
	}

	Keydown_CandiList_UD(e) {
		var key_upper	= e.key.toUpperCase();
		var editing		= this.GetEditingCandi;
		var no			= editing.candi.no;
		if (key_upper == 'ARROWUP') {						// ↑
			no	-= 1;
		} else if (key_upper == 'ARROWDOWN') {				// ↓
			no	+= 1;
		}
		if (no < 1) {
			no	= editing.candicount;
		}
		if (editing.candicount < no) {
			no	= 1;
		}
		this.SetEditingCandi(no);
	}

	KeyDownTimeInput_LR(no, st_end, h_m, key_upper) {
		var prefix	= '#id_ok_' + no + '_';
		var result	= super.KeyDownTimeInput_LR(prefix, st_end, h_m, key_upper, true);
		if (result.edge_detect != 0) {
			no	+= result.edge_detect;
			var editing	= this.GetEditingCandi;
			if (no < 1) {
				no	= editing.candi.oks.length;
			}
			if (editing.candi.oks.length < no) {
				no	= 1;
			}
			var id_el	= '#id_ok_' + no + '_' + result.id_new;
			$(id_el).focus();
		} else {
			var id_el	= result.id_new;
		}
		this.id_to_focus	= id_el;
	}

	KeyDownTimeInput_UD(no, st_end, h_m, key_upper) {
		var prefix	= '#id_ok_' + no + '_';
		EleValueChange_ByUpDown_HourMin(prefix, st_end, h_m, key_upper);
		this.UpdateOksTimeFromInput();
		this.CheckOkWarning();
		var editing	= this.GetEditingCandi;
		for (var ok of editing.candi.oks) {
			var id_el_warning	= '#id_ok_' + ok.no + '_warning';
			$(id_el_warning).text(ok.warning);
		}
		SortAndNumberOks(editing.candi);
		JudgeCandiStatus(editing.candi);
		this.CandisUpdated(true);
	}

	SetScrollCb() {
		console.log('SetScrollCb');
		var app	= this;
		setTimeout(() => {
			$('.cls_calendar_area').scroll(
				function (event) {
					var jq_calendar_area	= $(event.target)
					app.OP_SyncScroll(jq_calendar_area);
				}
			);
		}, 100);
	}

	CandisUpdated(guard_detail=false) {
		this.DrawCandis(guard_detail);
		this.DrawSelectCalendar();
		this.cb_change(this.candis);
	}

	UpdateOksTimeFromInput() {
		var editing	= this.GetEditingCandi;
		for (var ok of editing.candi.oks) {
			for (var st_end of ['start', 'end']) {
				var id_el_hour	= '#id_ok_' + ok.no + '_' + st_end + '_h';
				var id_el_min	= '#id_ok_' + ok.no + '_' + st_end + '_m';
				var value_h		= $(id_el_hour).val();
				value_h			= parseInt(value_h);
				var value_m		= $(id_el_min).val();
				value_m			= parseInt(value_m);
				var dt			= ok['dt_' + st_end];
				dt.setHours(value_h);
				dt.setMinutes(value_m);
			}
		}
	}

	CheckOkWarning() {
		var editing	= this.GetEditingCandi;
		for (var ok of editing.candi.oks) {
			var milli_diff	= ok.dt_end.getTime() - ok.dt_start.getTime();
			var min_diff	= milli_diff / 1000 / 60;
			var prev		= ok.warning;
			if (min_diff < this.min_needtime) {
				ok.warning	= this.MakeWording('needtime_shortage', {'needtime':this.min_needtime});
			} else if (IsOutOfCanditime(editing.candi, ok.dt_start, ok.dt_end)) {
				ok.warning	= this.MakeWording('outof_canditime');
			} else {
				ok.warning	= '';
			}
		}
	}

	KeyDownTimeInput_Delete(no) {
		var editing	= this.GetEditingCandi;
		var candi	= editing.candi;
		candi.oks.splice(no-1, 1);
		SortAndNumberOks(candi);
		this.CandisUpdated();
	}

	KeyDownTimeInput_Merge(no) {
		var editing	= this.GetEditingCandi;
		var candi	= editing.candi;
		if (no == 1) {
			var str_warning	= this.MakeWording('mergeng_nottop');
			alert(str_warning);
			return;
		}
		var ok1		= candi.oks[no-2];
		var ok2		= candi.oks[no-1];
		if (!IsContinuous(ok1, ok2)) {
			var str_warning	= this.MakeWording('mergeng_notconti');
			alert(str_warning);
			return;
		}
		ok1.dt_end	= ok2.dt_end;
		candi.oks.splice(no-1, 1);
		this.CheckOkWarning();
		SortAndNumberOks(candi);
		this.CandisUpdated();

	}

	KeyDownTimeInput_Move2Comment() {
		$('#id_textarea_comment').focus();
	}

	SetAllOkNg(no, type_ok) {
		var candi_target	= null;
		for (var candi of this.candis) {
			if (candi.no == no) {
				candi_target	= candi;
			}
		}
		if (candi_target == null) {
			console.log('candi_target == null');
			return;
		}
		if (type_ok) {
			var ok_new			= {'warning':''};
			ok_new.dt_start		= new Date(candi_target.dt_start);
			ok_new.dt_end		= new Date(candi_target.dt_end);
			candi_target.oks	= [ok_new]
			candi_target.status	= 'CANDI_STS_OK'
		} else {
			candi_target.oks	= []
			candi_target.status	= 'CANDI_STS_NG'
		}
		SortAndNumberOks(candi_target);
		JudgeCandiStatus(candi_target);
		this.CandisUpdated();
	}

	SetIdToFocus(candi) {
		if (candi == null || candi.oks.length == 0) {
			this.id_to_focus	= '#id_keydown_receiver';
		} else {
			this.id_to_focus	= '#id_ok_1_start_h';
		}
		this.FocusArea();
	}

	SetCandisCb() {
		var app	= this;
		$('.td_candi_info').on('click',
			function (e) {
				console.log('detail', e);
				app.OP_ClickCandi(e);
			}
		)
		$('.btn_kirari').on('click',
			function (e) {
				app.OP_ClickOneTouchEdit(e);
			}
		)
		$('#id_keydown_receiver').on('keydown',
			function (e) {
				app.OP_CandiList_Keydown(e);
			}
		)
	}

	SetDetailCb() {
		var app	= this;
		$('.cls_timeinput').on('keydown',
			function (e) {
				app.OP_KeyDownTimeInput(e);
			}
		)
		$('#id_textarea_comment').on('keyup',
			function(e) {
				app.OP_KeyUpComment(e);
			}
		)
	}

	FocusArea() {
		if (this.id_to_focus == null) {
			return;
		}
		setTimeout(() => {
			$(this.id_to_focus).focus();
			console.log('this.id_to_focus=', this.id_to_focus);
		}, (100));
	}

	DrawCandis(guard_detail=false) {
		//console.log('DrawCandis');
		var html_summary	= this.MakeHtml_CandiList();
		$('#id_td_candi_summary').html(html_summary);
		this.SetCandisCb();
		if (guard_detail == false) {
			var editing		= this.GetEditingCandi;
			var html_detail	= this.MakeHtml_CandiDetail(editing);
			$('#id_td_candi_detail').html(html_detail);
			this.SetDetailCb();
			this.SetIdToFocus(editing.candi)
		}
	}

	DrawSelectCalendar() {
		if (!this.candis) {
			return;
		}
		this.cal_selects.removeAllEvents();
		for (var candi of this.candis) {
			var event	= {}
			event.title		= candi.title;
			event.start		= candi.dt_start.toISOString();
			event.end		= candi.dt_end.toISOString();
			event.color		= this.options.event_color_candi;
			event.display	= 'background';
			candi.orgtype	= 'candi';
			event.org		= candi;
			this.cal_selects.addEvent(event);

			for (var ok of candi.oks) {
				var event	= {}
				event.title		= 'OK'
				event.start		= ok.dt_start.toISOString();
				event.end		= ok.dt_end.toISOString();
				event.color		= this.options.event_color_ok;
				ok.orgtype		= 'ok';
				event.org		= ok;
				this.cal_selects.addEvent(event);
			}
		}
	}

	DrawExistCalendar() {
		if (!this.exists) {
			return;
		}
		//this.cal_exists.eventColor	= this.options.event_color_exist;
		this.cal_exists.removeAllEvents();
		for (var exist of this.exists) {
			var event	= {}
			event.title		= exist.title;
			event.start		= exist.dt_start.toISOString();
			event.end		= exist.dt_end.toISOString();
			event.color		= this.options.event_color_exist;
			exist.orgtype	= 'exist';
			event.org		= exist;
			this.cal_exists.addEvent(event);
		}
	}

	InitDraw() {
		console.log('InitDraw')
		this.CreateParentArea();
		this.CreateCandisArea();
		this.CreateCalendarsArea();
		this.SizeChanged();
	}

	CreateParentArea() {
		$(this.div_drawarea).html('');
		var dom_parent	= '<table border="0" id="id_parent_tbl"><tr><td id="id_td_left" style="vertical-align:top; border:none;"></td>'
		dom_parent		+= '<td id="id_td_right" style="border:none;"></td></tr></table>'
		$(this.div_drawarea).append(dom_parent);
	}
	CreateCandisArea() {
		var dom_left	= '<div class="candiboxes_area" id="id_candis_area"></div>'
		$('#id_td_left').append(dom_left)

		$('#id_candis_area').html('');
		var html_candis	= '<div class="candiboxes_body">';
		html_candis		+= '<table><tr><td id="id_td_candi_summary">';
		html_candis		+= '</td></tr><tr><td id="id_td_candi_detail">';
		html_candis		+= '</td></tr></table>';
		html_candis		+= '</div>';
		$('#id_candis_area').append(html_candis);
	}
		
	CreateCalendarsArea() {
		var dom_right	= '<table border="" id="id_right_tbl"><tr><td colspan="2" id="id_cal_title"></td></tr><tr>'
		var dom_cal		= '<div class="cls_calendar_area"><div class="cls_calendar_body" id="'
		dom_right		+= '<td class="cls_td_calendar">' + dom_cal + CandisCommon.CALID_EXISTS + '"></div></div></td>'
		dom_right		+= '<td class="cls_td_calendar">' + dom_cal + CandisCommon.CALID_SELECTS + '"></div></div></td>'
		dom_right		+= '</tr></table>'
		$('#id_td_right').append(dom_right)

		var el_cal_exists	= $('#' + CandisCommon.CALID_EXISTS)[0]
		var cal_exists		= new FullCalendar.Calendar(el_cal_exists, GetCalParams_SeleCandis(this));
		cal_exists.render();
		var el_selects		= $('#' + CandisCommon.CALID_SELECTS)[0]
		var cal_selects		= new FullCalendar.Calendar(el_selects, GetCalParams_SeleCandis(this));
		cal_selects.render();

		this.DrawHideUpper();
		this.cal_exists		= cal_exists;
		this.cal_selects	= cal_selects;
	}

	SizeChanged() {
		console.log('SizeChanged');
		this.widths		= this.CalcWidths();
		this.heights	= this.CalcHeights();
		this.DrawSetWidths();
		this.DrawSetHeight();
		this.DrawSetCalScrollPos();
		if (this.candis != null) {
			this.DrawCandis();
		}
		this.DrawSelectCalendar();
		this.DrawExistCalendar();
	}

	AppearrenceChanged() {
		if (this.candis != null) {
			this.DrawCandis();
			//for (var candi of this.candis) {
			//	candi.title	= this.MakeWording('candititle', {'candi_no' : candi.no});
			//}
		}
		this.DrawSelectCalendar();
		this.DrawExistCalendar();
	}

	CalcWidths() {
		var width_all	= this.options.width;
		var widths		= {};
		widths.all		= width_all;
		widths.left		= parseInt(width_all * 6.5 / 10);
		const margin_right	= 10;
		widths.right	= parseInt(width_all * 3.5 / 10 - margin_right);
		widths.exists	= parseInt(widths.right * 7 / 10);
		const margin_selects	= 10;
		widths.selects	= parseInt(widths.right * 3 / 10 - margin_selects);

		widths.candi_all	= widths.left;
		widths.candi_detail	= widths.candi_all - SeleCandis.WIDTH_CANDIBTNS;
		var margin_comment	= 60;
		widths.comment		= widths.candi_all - margin_comment;
		console.log('all/left/right/exists/selects=', widths.all, widths.left, widths.right, widths.exists, widths.selects);
		console.log('candi_all/candi_detail/comment=', widths.candi_all, widths.candi_detail, widths.comment);
		return widths;
	}

	CalcHeights() {
		var height_all	= this.options.height;
		var heights		= {};
		heights.title			= 40;
		heights.candis_area		= height_all;
		heights.calendarbody	= height_all - heights.title;
		console.log('all/candis_area/calendarbody=', height_all, heights.candis_area, heights.calendarbody);
		return heights;
	}

	DrawSetWidths() {
		var widths		= this.widths;
		$('#id_parent_tbl').css('width', widths.width_all);
		$('#id_td_left').css('width', widths.left);
		$('#id_right_tbl').css('width', widths.right);
		var jq_td_exists	= $('#' + CandisCommon.CALID_EXISTS).parent().parent();
		var jq_td_selects	= $('#' + CandisCommon.CALID_SELECTS).parent().parent();
		jq_td_exists.css('width', widths.exists);
		jq_td_selects.css('width', widths.selects);
	}

	DrawSetHeight() {
		var heights			= this.heights;
		var jq_td_calendar	= $('.cls_td_calendar');
		jq_td_calendar.css('height', '' + (heights.calendarbody) + 'px');
		$('#id_candis_area').css('height', '' + (heights.candis_area) + 'px');
	}

	DrawSetCalScrollPos() {
		if (!this.candis || this.candis.length == 0) {
			return;
		}
		var editing			= this.GetEditingCandi;
		var candi			= editing.candi;
		var hour_toshow		= candi.dt_start.getHours() + candi.dt_start.getMinutes() / 60;
		var hour_all		= this.options.endhour - this.options.starthour;
		var jq_cal_area		= $('.cls_calendar_area').get(0)
		var height_all		= jq_cal_area.scrollHeight;
		var height_shown	= jq_cal_area.offsetHeight;
		let CONST_DISPMARGIN	= 0.5;
		var height_1hour	= height_all / (0.3 + 0.5 + hour_all);										// 余白0.3、終日予定0.5、を足す
		var hour_diffshow	= hour_toshow - this.options.starthour + 0.3 + 0.5 - CONST_DISPMARGIN;	// 余白0.3、終日予定0.5、を足す。　30分前を表示
		// 候補枠の表示をランダムで少しだけ上下させて、candi切替前から時間軸が変化した事を認識しやすくする
		var hour_random		= -0.25 + Math.random() * 0.5;
		hour_diffshow		+= hour_random;
		var height_toshow	= height_1hour * hour_diffshow;
		height_toshow		= parseInt(height_toshow);
		$('.cls_calendar_area').scrollTop(height_toshow);
		console.log('height_shown/height_all=', height_shown, '/', height_all, 'hour_toshow/hour_all=', hour_toshow, '/', hour_all, 'height_toshow=', height_toshow);
	}

	MakeHtml_CandiList() {
		var html_candis		= '';
		var title_schedule	= this.MakeWording('title_schedule');
		var title_needtime	= this.MakeWording('title_needtime');
		var needtime		= this.MakeWording('needtime', {'needtime':this.min_needtime});
		var title_candi		= this.MakeWording('title_candi');
		var title_status	= this.MakeWording('title_status');
		var title_detail	= this.MakeWording('title_detail');
		var title_1touch	= this.MakeWording('title_1touch');
		var widths			= this.widths;

		var margin_title	= 90;
		var width_title	= widths.candi_all - 180 - 120 - 100 - margin_title;
		var css_hd		= ' style="background-color:' + this.options.title_color + '; ';
		html_candis		+= '<input type="text" id="id_keydown_receiver" readonly>';
		html_candis		+= '<table class="cls_candis_tbl">';
		html_candis		+= '<tr style="height:1px;"><td colspan="4"></td></tr><tr>';
		html_candis		+= '<th' + css_hd + 'width:180px;">' + title_schedule + '</th>'
		html_candis		+= '<td style="width:' + width_title + 'px;">' + this.title + '</td>';
		html_candis		+= '<th' + css_hd + 'width:120px;">' + title_needtime + '</th>'
		html_candis		+= '<td style="width:100px;" align="center">' + needtime + '</td>';
		html_candis		+= '</tr></table>';
	
		var css_hd_detail	= ' align="left" style="background-color:' + this.options.title_color;
		html_candis		+= '<table class="cls_candis_tbl">';
		html_candis		+= '<tr style="height:15px;"><td colspan="7"></td></tr>';
		html_candis		+= '<tr><th' + css_hd + '" align="center" colspan=2>' + title_candi + '</th>'
		html_candis		+= '<th' + css_hd + '">' + title_status + '</th>';
		html_candis		+= '<th' + css_hd_detail + '">' + title_detail + '</th>';
		html_candis		+= '<th' + css_hd + '" align="center" colspan="2">' + title_1touch + '</th></tr>';
		for (var candi of this.candis) {
			html_candis		+= this.MakeHtml_1Candi(candi);
		}
		var candilist_operation	= this.MakeWording('candilist_operation');
		html_candis		+= '<tr><td colspan="5">' + candilist_operation + '</td></tr>';
		html_candis		+= '</table>';
		return html_candis;
	}

	MakeHtml_1Candi(candi) {
		var widths			= this.widths;
		var html_td_detail	= 'style="width:' + widths.candi_detail + 'px;"'
		var html_candi		= '';
		var html_edit_tr	= (candi.editing) ? 'class="cls_editing"' : '';
		var html_edit_left	= (candi.editing) ? ' cls_td_mostleft ' : '';
		var html_edit_right	= (candi.editing) ? 'class="cls_td_mostright"' : '';
		html_candi		+= '<tr ' + html_edit_tr + ' id="candi_' + candi.no + '">';
		var candititle	= this.MakeWording('candititle', {'candi_no' : candi.no});
		html_candi		+= '<td class="td_candi_info ' + html_edit_left + '">' + candititle + '</td>';
		html_candi		+= '<td class="td_candi_info">' + this.options.func_date2str(candi.dt_start) + '<br>';
		html_candi		+= GetTmStr(candi.dt_start) + '～' + GetTmStr(candi.dt_end) + '</td>';
		html_candi		+= '<td class="td_candi_info" align="center"><img class="cls_marubatu" src="' + GetStatusMarkUrl(candi) + '"/></td>';
		html_candi		+= '<td colspan="1" class="td_candi_info" ' + html_td_detail + '>';
		if (candi.status == 'CANDI_STS_OK') {
			var str_wording	= this.MakeWording('detail_allok');
			html_candi	+= str_wording + '<br>';
		} else {
			for (var ok of candi.oks) {
				var str_wording	= this.MakeWording('detail_description', {'time_start':GetTmStr(ok.dt_start), 'time_end':GetTmStr(ok.dt_end)});
				html_candi	+= str_wording;
				if (ok.warning != '') {
					html_candi	+= ' (<font style="color:red;">' + ok.warning + '</font>' + ')';
				}
				html_candi	+= '<br>';
			}
		}
		html_candi		+= candi.comment + '</td>';
		html_candi		+= '<td id="quickbtn_ok" ' + '><a href="javascript:void(0);" class="btn_kirari btn_kirari_blue">OK</a></td>';
		html_candi		+= '<td id="quickbtn_ng" ' + html_edit_right + '><a href="javascript:void(0);" class="btn_kirari btn_kirari_red">NG</a></td>';
		html_candi		+= '</tr>';
		return html_candi;

	}

	MakeHtml_CandiDetail(editinginfo) {
		if (editinginfo.candicount == 0) {
			return '';
		}
		var candi		= editinginfo.candi;
		var html_candi	= '<table class="cls_candis_tbl">'
		html_candi		+= '<tr style="height:15px;"><td colspan="2"></td></tr>';
		var widths		= this.widths;
		var str_date	= this.options.func_date2str(candi.dt_start);
		var params		= {'candi_no':candi.no, 'date':str_date, 'time_start':GetTmStr(candi.dt_start), 'time_end':GetTmStr(candi.dt_end)};
		var html_hd		= 'th colspan="2" style="background-color:' + this.options.title_color + ';width:' + widths.comment + 'px "';
		var title_detail_area	= this.MakeWording('title_detail_area', params);
		html_candi		+= '<tr><' + html_hd + '>' + title_detail_area + '</th></tr>';
		for (var o in candi.oks) {
			var ok		= candi.oks[o];
			var id_ok	= 'id_ok_' + ok.no + '_'
			html_candi	+= '<tr><td style="width:180px;">'
			html_candi	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'start_h" value="' + ok.dt_start.getHours() + '"></input>'
			html_candi	+= '<label class="cls_timeinput">:</label>'
			html_candi	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'start_m" value="' + MinStr(ok.dt_start) + '"></input>'
			html_candi	+= '<label class="cls_timeinput">～</label>'
			html_candi	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'end_h" value="' + ok.dt_end.getHours() + '"></input>'
			html_candi	+= '<label class="cls_timeinput">:</label>'
			html_candi	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'end_m" value="' + MinStr(ok.dt_end) + '"></input>'
			html_candi	+= '</td><td><label id="' + id_ok + 'warning" style="color:red;">' + ok.warning + '</label>'
			html_candi	+= '</td></tr>'
		}
		var detail_operation	= this.MakeWording('detail_operation');
		html_candi		+= '<tr><td colspan="2">' + detail_operation + '</td></tr>';
		html_candi		+= '<tr><td colspan="2"><textarea id="id_textarea_comment" style="width:' + (widths.comment) + 'px; height:60px;"></textarea></td></tr>';
		html_candi		+= '</table>';
		return html_candi;
	}

	MoveDay(dtd) {
		if (this.dtd_cal && this.dtd_cal.getMonth() == dtd.getMonth() && this.dtd_cal.getDate() == dtd.getDate()) {
			return;
		}
		this.dtd_cal	= dtd;
		this.cal_exists.gotoDate(dtd);
		this.cal_selects.gotoDate(dtd);
		var str_1st	= this.options.func_date2str(dtd);
		$('#id_cal_title').text(str_1st);
		$('#id_cal_title').css('padding-left', '100px');
		$('#id_cal_title').animate({'padding-left':'10px'}, 400, 'swing');
		this.DrawHideUpper();
		this.DrawSetCalScrollPos()
	}
	
	DrawHideUpper() {
		var selects				= '#' + CandisCommon.CALID_SELECTS
		var jq_selects_label	= $(selects + ' .fc-timegrid-slot-label')
		var jq_selects_axis		= $(selects + ' .fc-timegrid-axis')
//		var jq_selects_lane		= $(selects + ' .fc-timegrid-slot-lane')
		jq_selects_label.css('display', 'none');
		jq_selects_axis.css('display', 'none');
//		jq_selects_lane.css('display', 'none');
		$('.fc-scrollgrid-section-header').css('display', 'none');
		$('.fc-header-toolbar fc-toolbar').css('display', 'none');
	}

}




function GetCalParams_MakeCandis(parent) {
	var params = 
	{
		initialView				: 'timeGridWeek',
		locale					: parent.options.calendar_locale,
		weekends				: false,
		selectable				: true,
		allDaySlot				: true,
		nowIndicator			: true,
		contentHeight			: 'auto',
		slotDuration			: '00:' + parent.options.slotsize + ':00', 
		slotLabelInterval		: '01:00:00', 

		headerToolbar	: {
			left	: 'title',
			center	: null,
			right	: 'prev,next,today,timeGridDay,timrGrid3Day,timeGridWeek',
		},
		views: {
			timeGridWeek: {
				slotMinTime	: parent.options.starthour + ':00:00',
				slotMaxTime	: parent.options.endhour + ':00:00',
			},
			timeGridDay: {
				buttonText	: '1日',
				slotMinTime	: parent.options.starthour + ':00:00',
				slotMaxTime	: parent.options.endhour + ':00:00',
				titleFormat	: function (date) {
					return parent.options.func_date2str(date.start.marker)
				},
			},
			timrGrid3Day: {
				buttonText	: '3日',
				type		: 'timeGrid',
				duration	: { days: 3 },
				slotMinTime	: parent.options.starthour + ':00:00',
				slotMaxTime	: parent.options.endhour + ':00:00',
				titleFormat	: function (date) {
					return parent.options.func_date2str(date.start.marker) + '～'
				},
			},
		},

		select			: function(info) {
			parent.OP_SpanSelect(info.start, info.end);

		},
		eventClick		: function(info) {
			var sche	= info.event._def.extendedProps.org;
			parent.OP_EventClick(sche);
		},
		eventMouseEnter	: function(info) {
			parent.OP_EventMouseEnter(info);
		},
		eventMouseLeave	: function(info) {
			parent.OP_EventMouseLeave(info);
		},
	}
	return params
}


function GetCalParams_SeleCandis(parent) {
	var params = 
	{
		initialView				: 'timeGridDay',
		locale					: parent.options.calendar_locale,
		weekends				: false,
		selectable				: true,
		allDaySlot				: true,
		nowIndicator			: true,
		contentHeight			: 'auto',
		slotDuration			: '00:' + parent.options.slotsize + ':00', 
		slotLabelInterval		: '01:00:00', 

		headerToolbar	: {
			left	: null,
			right	: null,
			center	: null,
		},
		views: {
			timeGridDay: {
				slotMinTime	: parent.options.starthour + ':00:00',
				slotMaxTime	: parent.options.endhour + ':00:00',
			},
		},

		select			: function(info) {
			if (parent) {
				parent.OP_SpanSelect(info.start, info.end);
			} else {
				this.unselect();
			}
		},
		eventClick		: function(info) {
			var sche	= info.event._def.extendedProps.org;
			parent.OP_EventClick(sche);
		},
		eventMouseEnter	: function(info) {
		},
		eventMouseLeave	: function(info) {
		},
	}
	return params
}


function GetTmStr(dt) {
	var str_tm	= '';
	str_tm		+= ('' + dt.getHours()) + ':';
	str_tm		+= ('0' + dt.getMinutes()).slice(-2);
	return str_tm
}
function GetDateStr(dt) {
	var str_dtd	= ('' + (dt.getMonth() + 1)) + '/';
	str_dtd		+= ('' + dt.getDate());
	var youbi	= GetYoubiStr(dt);
	str_dtd		+= '(' + youbi + ') ';
	return str_dtd;
}
function GetYoubiStr(dt) {
	var weekday = [ '日', '月', '火', '水', '木', '金', '土' ] ;
	var	str = weekday[dt.getDay()];
	return str;
}


function CB_SortDtStart(a, b) {
	if (a.dt_start < b.dt_start) {
		return -1;
	} else if (b.dt_start < a.dt_start) {
		return 1;
	}
	return 0;
}


function OverlapExist(candi, ok_new) {
	for (var ok of candi.oks) {
		if (IsOverlap(ok, ok_new)) {
			return true
		}
	}
	return false;
}
function IsOverlap(span1, span2) {
	if (span1.dt_end <= span2.dt_start || span2.dt_end <= span1.dt_start) {
		return false;
	} else {
		return true;
	}
}
function ContinuesExist(candi, ok_new) {
	for (var ok of candi.oks) {
		if (IsContinuous(ok, ok_new)) {
			return true
		}
	}
	return false;
}
function IsContinuous(span1, span2) {
	if (span1.dt_end < span2.dt_start || span2.dt_end < span1.dt_start) {
		return false;
	} else {
		return true;
	}
}

function GetStatusMark(candi) {
	if (candi.status == null) {
		return 'hatena.png';
	} else if (candi.status == 'CANDI_STS_UNKNOWN') {
		return 'hatena.png';
	} else if (candi.status == 'CANDI_STS_OK') {
		return 'maru.png';
	} else if (candi.status == 'CANDI_STS_NG') {
		return 'batsu.png';
	} else if (candi.status == 'CANDI_STS_PARTIAL') {
		return 'sankaku.png';
	}
}

function GetStatusMarkUrl(candi) {
	var url	= GetOwnUrl();
	url		+= 'image/' + GetStatusMark(candi);
	return url;
}

function MinStr(dt) { 
	return ('0' + dt.getMinutes()).slice(-2);
}

function IsSameTime(dt1, dt2) {
	if (dt1.getTime() == dt2.getTime()) {
		return true;
	} else {
		return false;
	}
}

function GetOwnUrl() {
    var url;
    var scripts = document.getElementsByTagName("script");
    var i = scripts.length;
    while (i--) {
        var match = scripts[i].src.match(/(^|.*\/)ScheCandis\.js$/); //sampleのところは自身のjsファイル名に変更する
        if (match) {
            url = match[1];
            break;
        }
    }
    return url;
}
 
function GetValueFromEle(id_el) {
	var str_value	= $(id_el).val();
	var int_value	= parseInt(str_value);
	return int_value;
}

function EleValueChange_ByUpDown(id_el, min, max, movesize, zerotop, key_upper) {
	var value		= $(id_el).val();
	value			= parseInt(value);
	var addvalue	= (key_upper == 'ARROWUP') ? -1 : 1;
	addvalue		*= movesize;
	value			+= addvalue;
	if (value < min) {
		value	= max;
	}
	if (max < value) {
		value	= min;
	}
	if (zerotop) {
		value	= ('0' + value).slice(-2)
	}
	$(id_el).val(value);
	value	= parseInt(value);
	return value;
}

function EleValueChange_ByUpDown_HourMin(prefix, st_end, h_m, key_upper) {
	var id_el	= prefix + st_end + '_' + h_m;
	if (h_m == 'h') {
		var max			= 23;
		var movesize	= 1;
		var zerotop		= false;
	} else {
		var max			= 55;
		var movesize	= 5;
		var zerotop		= true;
	}
	var value	= EleValueChange_ByUpDown(id_el, 0, max, movesize, zerotop, key_upper);

	var add_hour	= 0;
	if (value == 0 && h_m == 'm' && key_upper == 'ARROWDOWN') {
		add_hour	= 1;
	}
	if (value == 55 && h_m == 'm' && key_upper == 'ARROWUP') {
		add_hour	= -1;
	}
	if (add_hour != 0) {
		var id_el_h	= prefix + st_end + '_h';
		var value	= $(id_el_h).val();
		value		= parseInt(value);
		value		+= add_hour;
		$(id_el_h).val(value);
	}
}

function EleValueChange_ByUpDown_Date(dtd_org, key_upper, func_date2str, id_el) {
	var dtd_new	= new Date(dtd_org);
	if (key_upper == 'ARROWUP') {
		var inc	= (dtd_org.getDay() == 1) ? -3: -1;
		dtd_new.setDate(dtd_new.getDate() + inc);
	} else if (key_upper == 'ARROWDOWN') {
		var inc	= (dtd_org.getDay() == 5) ? 3: 1;
		dtd_new.setDate(dtd_new.getDate() + inc);
	}
	var str_dtd	= func_date2str(dtd_new);
	$(id_el).val(str_dtd);
	return dtd_new;
}

function IsOutOfCanditime(candi, dt_start, dt_end) {
	if (candi.dt_start <= dt_start && dt_end <= candi.dt_end) {
		return false;
	} else {
		return true;
	}
}

function SortAndNumberOks(candi) {
	candi.oks.sort(CB_SortDtStart);
	for (var no = 1; no <= candi.oks.length; no++) {
		var ok		= candi.oks[no-1];
		ok.no		= no;
		if (ok.warning == null) {
			ok.warning	= '';
		}
	}
}

function MergeOks(candi) {
	SortAndNumberOks(candi);
	for (var i = candi.oks.length - 1; 0 < i; i--) {
		var ok1	= candi.oks[i];
		for (var j = candi.oks.length - 2; 0 <= j; j--) {
			var ok2	= candi.oks[j];
			if (IsContinuous(ok1, ok2)) {
				ok2.dt_start	= Math.min(ok1.dt_start, ok2.dt_start);
				ok2.dt_end		= Math.max(ok1.dt_end, ok2.dt_end);
				ok2.dt_start	= new Date(ok2.dt_start);
				ok2.dt_end		= new Date(ok2.dt_end);
				candi.oks.splice(i, 1);
				break;
			}
		}			
	}
}

function JudgeCandiStatus(candi) {
	var status	= 'CANDI_STS_UNKNOWN';
	if (candi.oks.length == 1 && IsSameTime(candi.oks[0].dt_start, candi.dt_start) && IsSameTime(candi.oks[0].dt_end, candi.dt_end)) {
		status	= 'CANDI_STS_OK';
	} else if (candi.oks.length == 0) {
		status	= 'CANDI_STS_NG';
	} else {
		status	= 'CANDI_STS_PARTIAL';
	}
	candi.status	= status;
}




