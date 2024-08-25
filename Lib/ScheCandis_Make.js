class MakeCandis extends CandisCommon {
	static option_params	= [
		['WINSIZE',		'width_list_btn',		60],
		['WINSIZE',		'width_list_label',		50],
		['APPERANCE',	'dp_dateformat',		'm/d(D)'],
		['APPERANCE',	'dp_daysofweek',		[ '日', '月', '火', '水', '木', '金', '土']],
		['APPERANCE',	'show_finalanswer',		true],
		['WORDING',		'title_newcandi',		'新候補日時'],
		['WORDING',		'title_editcandi',		'日時編集'],
		['WORDING',		'title_explanation',	'ショートカット'],
		['WORDING',		'title_finalanswer',	'候補一覧保存'],
		['WORDING',		'btn_newcandi_start',	'候補日時追加'],
		['WORDING',		'btn_delcandi',			'削除'],
		['WORDING',		'btn_new_add',			'一覧へ追加'],
		['WORDING',		'btn_new_edit',			'編集完了'],
		['WORDING',		'btn_new_cancel',		'キャンセル'],
		['WORDING',		'ope_all',				'※ Ctrl+⇅:入力欄移動、⇅:時間操作、↔:時間欄移動、(日付選択画面)Ctrl+十字キー:日付移動、Enter:日付選択'],
		['WORDING',		'warning_conflict',		'候補{{candi_no1}}と候補{{candi_no2}}の時間が重なってます'],
		['WORDING',		'warning_conflict_new',	'候補{{candi_no}}と時間が重なってます'],
	];

	constructor(div_drawarea, cb_change) {
		super();
		this.div_drawarea		= div_drawarea;
		this.cb_change			= cb_change;
		this.focusarea			= 'FOCUSAREA_TITLE';
		this.newwaku_visible	= false;
		this.InitOptions();
		this.InitDraw();
		/*
		var app = this;
		setTimeout(() => {
			app.Data_AddNewWaku_Next2Exist();
		}, (2000));
		*/
	}

	SetData(data) {
		this.data		= data;
		if (data.sche_info.min_needtime == null) {
			data.sche_info.min_needtime = this.options.min_needtime;
		}
		if (!data.ope_info.candis_warning) {
			data.ope_info.candis_warning	= '';
		}
		data.ope_info.index_editing	= 0;
		this.SortCandis(data.candis);
		this.DrawCandis();
		if (this.data.candis.length == 0) {
//			this.ChangeFocusArea('FOCUSAREA_TITLE');
			this.FocusArea('#id_textarea_title');
		} else {
//			this.ChangeFocusArea('FOCUSAREA_CANDILIST');
			this.FocusArea('#id_keydown_receiver');
		}
		this.DrawCal_AddExists();
		this.DrawCal_MoveDay(data.sche_info.range_adjust.dtd_start);
	}

	InitOptions() {
		super.InitOptions();
	}

	GetOptionParams() {
		return MakeCandis.option_params;
	}

	/*
	ChangeFocusArea(focusarea, nodraw=false) {
	}
	*/

	InitDraw() {
		console.log('InitDraw')
		this.CreateParentArea();
		this.CreateCandisArea();
		this.CreateCalendarsArea();
		this.SizeChanged();
	}

	AppearrenceChanged() {
		if (this.data != null) {
			this.DrawCandis();
		}
		this.DrawCal_AddExists();
	}

	SizeChanged() {
		console.log('SizeChanged');
		this.widths		= this.CalcWidths();
		this.heights	= this.CalcHeights();
		var widths		= this.widths;
		var heights		= this.heights;
		var str_log	= '[WIDTH] all=' + widths.all + ', left=' + widths.left + ' + right=' + widths.right;
		str_log		+= ', exists=' + widths.exists + ', candi_all=' + widths.candi_all;
		str_log		+= ', list_btn=' + widths.list_btn + ', list_label=' + widths.list_label + ', list_dt=' + widths.list_dt;
		str_log		+= '　[HEIGHTS] all=' + heights.all + ', candis_area=' + heights.candis_area;
		str_log		+= ', calendarbody=' + heights.calendarbody;
		console.log(str_log);
		this.DrawSetWidths();
		this.DrawSetHeight();
		this.DrawCandis();
		this.DrawCal_AddExists();
		this.cal_exists.render();
	}


	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	//
	//												操作
	//
	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

	OP_Window_Focus() {
		this.FocusArea();	
	}

	// btn_tooltip_list 
	OP_CanliList_BtnMouseEnterLeave(e, is_enter) {
		var jq_btn		= $(e.target);
		var jq_td		= jq_btn.parent();
		//var jq_tr		= jq_td.parent();
		var btnid		= jq_btn.attr('id');
		var str_tooltip	= this.MakeWording('shortcut') + '=';

		if (btnid == 'id_btn_del') {
			str_tooltip	+= 'ctrl+d / Delete'
		} else if (btnid == 'id_btn_new') {
			str_tooltip	+= 'ctrl+i / +'
		} else if (btnid == 'id_btn_edit') {
			str_tooltip	+= 'ctrl+e / Enter'
		} else if (btnid == 'id_btn_save') {
			str_tooltip	+= 'ctrl+s'
		} else if (btnid == 'id_btn_cancel') {
			str_tooltip	+= 'ctrl+c / Escape'
		}
		if (!is_enter) {
			str_tooltip	= ''
		}
		var html_tooltip	= '　<font style="color:blue;">' + str_tooltip + '</font>';
		$('#span_ope_tooltip').html(html_tooltip);
	}

	// .id_textarea_title 
	OP_ClickTitle(e) {
		//this.ChangeFocusArea('FOCUSAREA_TITLE');
		this.FocusArea('#id_textarea_title');
		this.CandisUpdated();
	}

	// #id_textarea_title
	OP_KeyDownTitle(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		//this.ChangeFocusArea('FOCUSAREA_TITLE', true);
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			console.log('key_upper(Shift)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				var id_new	= this.Op_JudgeNextFocus(key_upper);
				this.data.ope_info.index_editing	= 0;
				this.FocusArea(id_new);
				this.CandisUpdated();
			}
		}
		this.Op_Common_KeyDown(e, key_upper);
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
		this.cb_change(this.data);
	}

	// #id_textarea_title #id_min_needtime #id_keydown_receiver #id_new_date 
	/*
	Keydown_ModeChange(e, key_upper) {
	}
	*/

	// #id_min_needtime 
	OP_ClickNeedMinInput(e) {
		/*
		var id_this		= $(e.target).attr('id');
		if (id_this == 'id_min_needtime') {
			this.ChangeFocusArea('FOCUSAREA_NEEDTIME');
		}
		*/
		this.FocusArea('#id_min_needtime');
		this.CandisUpdated();
	}

	// #id_min_needtime
	OP_KeyDownNeedMinInput(e) {
		var key_upper	= e.key.toUpperCase();
		var id_this		= $(e.target).attr('id');
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
//		this.ChangeFocusArea('FOCUSAREA_NEEDTIME', true);
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			console.log('key_upper(Shift)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				var id_new	= this.Op_JudgeNextFocus(key_upper);
				this.data.ope_info.index_editing	= 0;
				this.FocusArea(id_new);
				this.CandisUpdated();
				//				this.Keydown_ModeChange(e, key_upper);
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Only)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				var value	= EleValueChange_ByUpDown('#' + id_this, 0, 120, 5, false, key_upper);
				this.data.sche_info.min_needtime	= value;
				this.CandisUpdated();
			}
		}
		this.Op_Common_KeyDown(e, key_upper);
	}

	// .td_candi_info
	OP_ClickCandi(e) {
		var jq_tr	= $(e.target).parent();
		var index	= jq_tr.attr('id');
		for (var c in this.data.candis) {
			if (index == 'candi_' + c) {
				this.data.ope_info.index_editing	= parseInt(c);
				break;
			}
		}
//		this.ChangeFocusArea('FOCUSAREA_CANDILIST', true);
		this.DrawCandis();
		this.FocusArea('#id_keydown_receiver');
	}

	// #id_keydown_receiver
	OP_Make_CandiList_Keydown(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			console.log('key_upper(Ctrl)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
//				this.Keydown_ModeChange(e, key_upper);
				var id_new	= this.Op_JudgeNextFocus(key_upper);
				this.data.ope_info.index_editing	= 0;
				this.FocusArea(id_new);
				this.CandisUpdated();
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Only)=', key_upper);
			if (['ARROWUP', 'ARROWDOWN', 'ENTER', 'DELETE'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				this.Op_Keydown_CandiList_UD(key_upper);
			} else if ('ENTER' == key_upper) {
				var index	= this.data.ope_info.index_editing;
				var candi	= this.data.candis[index];
				this.Data_AddNewWaku(candi, true);
			}
		}
		this.Op_Common_KeyDown(e, key_upper)
	}

	// .btn_kirari
	OP_ClickBtn_CandiList(e) {
		console.log('OP_ClickBtn_CandiList, e=', e);
		var id_btn		= $(e.target).attr('id');
		var el_tr		= $(e.target).parent().parent();
		var candi_id	= el_tr.attr('id');
		if (id_btn == 'id_btn_del') {
			var index		= candi_id.replace('candi_', '');
			index			= parseInt(index);
			this.Data_DelCandi(index);
		} else if (id_btn == 'id_btn_new') {
			this.Data_AddNewWaku_Next2Exist();
		} else if (id_btn == 'id_btn_edit') {
			var index		= candi_id.replace('candi_', '');
			index			= parseInt(index);
			this.data.ope_info.index_editing	= index;
			var candi	= this.data.candis[index];
			this.Data_AddNewWaku(candi, true);
		}

		this.DrawCal_Candis();
	}

	// .btn_kirari_small
	OP_ClickBtn_NewCandi(e) {
		console.log('OP_ClickBtn_NewCandi, e=', e);
		var id_btn		= $(e.target).attr('id');
		if (id_btn == 'id_btn_save') {
			this.Op_SaveNew();
		} else if (id_btn == 'id_btn_cancel') {
			this.Data_CancelNew();
		}
	}

	// .cls_timeinput 
	OP_KeyDownDateTimeInput(e) {
		var key_upper	= e.key.toUpperCase();
		var id_this		= $(e.target).attr('id');
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		console.log('OP_KeyDownDateTimeInput', key_upper);
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			console.log('key_upper(Control)=', key_upper);
			if (key_upper == 'S') {
				e.preventDefault();
				this.Op_SaveNew();
			} else if (['ESCAPE', 'C'].indexOf(key_upper) != -1) {
				e.preventDefault();
				this.Data_CancelNew();
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			console.log('key_upper(Only)=', key_upper);
			if (key_upper == 'ESCAPE') {
				e.preventDefault();
				this.Data_CancelNew();
				return;
			}

			var id_this		= $(e.target).attr('id');
			if (id_this == 'id_new_date') {
				this.Op_KeyDownNewDateInput(e, key_upper);
			} else  {
				this.Op_KeyDownNewTimeInput(e, key_upper, id_this);
			}
		}
	}

	OP_Cal_EventMouseEnter(info) {
		console.log('OP_EventMouseEnter, info', info);	
	}

	OP_Cal_EventMouseLeave(info) {
		console.log('OP_EventMouseLeave, info', info);	
	}

	OP_Cal_EventClick(sche_clicked) {
		window.open(sche_clicked.url);
	}

	OP_Cal_SpanSelect(dt_start, dt_end) {
		this.cal_exists.unselect();
		var diff	= dt_end - dt_start;
		diff		/= (60 * 1000);
		if (diff < this.data.sche_info.min_needtime) {
			var str_wording	= this.MakeWording('needtime_shortage', {'needtime':this.data.sche_info.min_needtime})
			alert(str_wording);
			return;
		}
		//this.AddNewWaku(dt_start, dt_end);
		var newcandi		= {};
		newcandi.dt_start	= dt_start;
		newcandi.dt_end		= dt_end;
		this.Data_AddNewWaku(newcandi, false);

	}

	OP_DP_OnSelect(str_date, obj_inst) {
		var newcandi	= this.Data_MakeNewCandiFromEl();
		this.data.ope_info.newcandi	= newcandi;
		this.DrawUpdateNewWarning();

	}

	//	■■■■■■■■■■■■■■■■■■■
	//				回答提出
	//	■■■■■■■■■■■■■■■■■■■
	// btn_tooltip_fa 
	OP_FinalAnswer_Btn_MouseEnterLeave(e, is_enter) {
		var jq_td		= $(e.target).parent();
		//var jq_tr		= jq_td.parent();
		var btnid		= jq_td.attr('id');
		//console.log(btnid, is_enter);
		var str_tooltip	= this.MakeWording('shortcut') + '=';
		if (btnid == 'btn_finalanswer') {
			str_tooltip	+= 'ctrl+f / ctrl+shift+alt+Enter'
		}
		if (!is_enter) {
			str_tooltip	= ''
		}
		var html_tooltip	= '　<font style="color:blue;">' + str_tooltip + '</font>';
		$('#span_ope_tooltip').html(html_tooltip);
	}

	// .btn_tooltip_fa ()
	OP_FinalAnswer_Btns_Click(e) {
		var jq_td		= $(e.target).parent();
		var btnid		= jq_td.attr('id');
		console.log('btnid=', btnid);
		if (btnid == 'btn_finalanswer') {
			this.cb_change(this.data, true);
		}
	}


	Op_Common_KeyDown(e, key_upper) {
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			if (['D', 'I', 'E', 'F'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (key_upper == 'D') {
				var index		= this.data.ope_info.index_editing;
				this.Data_DelCandi(index);
			} else if (key_upper == 'I') {
				this.Data_AddNewWaku_Next2Exist();
			} else if (key_upper == 'E') {
				var index	= this.data.ope_info.index_editing;
				var candi	= this.data.candis[index];
				//this.Draw_AddNewWaku(candi.dt_start, candi.dt_end);
				this.Data_AddNewWaku(candi, true);
			} else if (key_upper == 'F') {
				this.cb_change(this.data, true);
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if ('DELETE' == key_upper) {
				e.preventDefault();
				this.Data_DelCandi(index);
			}
		}
		if (e.altKey && e.shiftKey && e.ctrlKey) {
			if ('ENTER' == key_upper) {
				e.preventDefault();
				this.cb_change(this.data, true);
			}
		}
	}

	Op_JudgeNextFocus(key_upper) {
		if (key_upper == 'ARROWUP') {
			var dir	= -1;
		} else if (key_upper == 'ARROWDOWN') {
			var dir	= +1;

		} else {
			alert('Op_JudgeNextFocus');
		}
		var ids	= ['#id_textarea_title',	'#id_min_needtime', '#id_keydown_receiver'];
		var id_now		= this.id_to_focus;
		var index_now	= ids.indexOf(id_now);
		var index_next	= LoopPos(index_now + dir, 0, 2);
		if (index_next == 2 && (!this.data || this.data.candis.length == 0)) {
			index_next	= LoopPos(index_next + dir, 0, 2);
		}
		var id_next	= ids[index_next];
		return id_next;
	}

	Op_Keydown_CandiList_UD(key_upper) {
		var index		= this.data.ope_info.index_editing;
		if (key_upper == 'ARROWUP') {						// ↑
			index	-= 1;
		} else if (key_upper == 'ARROWDOWN') {				// ↓
			index	+= 1;
		}
		if (index < 0) {
			index	= this.data.candis.length - 1;
		}
		if (this.data.candis.length <= index) {
			index	= 0;
		}
		this.data.ope_info.index_editing	= index;
		this.DrawCandis();
		var dtd_editing	= this.data.candis[index].dt_start;
		this.DrawCal_MoveDay(dtd_editing);
	}

	Op_KeyDownNewDateInput(e, key_upper) {
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if (['ARROWLEFT', 'ARROWRIGHT'].indexOf(key_upper) != -1) {
				if (key_upper == 'ARROWLEFT') {
					this.id_to_focus	= '#id_new_end_m';
				} else if (key_upper == 'ARROWRIGHT') {
					this.id_to_focus	= '#id_new_start_h';
				}
				e.preventDefault();
				$('#id_new_date').datepicker('hide');
				var app	= this;
				setTimeout(() => {
					$(app.id_to_focus).focus();
				}, 200);
			}
		}
	}

	Op_KeyDownNewTimeInput(e, key_upper, id_this) {
		var str_params	= id_this.replace('id_new_', '');
		var params		= str_params.split('_');
		var st_end		= params[0];
		var h_m			= params[1];

		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if (['ARROWLEFT', 'ARROWRIGHT'].indexOf(key_upper) != -1) {
				var result	= super.Op_KeyDownTimeInput_LR('#id_new_', st_end, h_m, key_upper, true);
				if (result.edge_detect == -1 || result.edge_detect == 1) {
					this.id_to_focus	= '#id_new_date';
					$(this.id_to_focus).focus();
					this.Draw_ShowDatePicker();
				} else {
					this.id_to_focus	= result.id_new;
				}	
			} else if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				e.preventDefault();
				EleValueChange_ByUpDown_HourMin('#id_new_', st_end, h_m, key_upper);
				this.DrawCal_Candis();
				this.DrawUpdateNewWarning();
			}
		}
	}

	Op_SaveNew() {
		this.newwaku_visible	= false;
		var newcandi	= this.Data_MakeNewCandiFromEl();
		if (this.newwku_editmode) {
			var index	= this.data.ope_info.index_editing;
			this.data.candis.splice(index, 1);
		}
		this.data.candis.push(newcandi);
		this.SortCandis(this.data.candis);
		this.Draw_DatepickerDelay_CandisUpdated('hide')
		this.FocusArea('#id_keydown_receiver')
	}

	Op_KeyDownTimeInput_LR(prefix, st_end, h_m, key_upper, notmove_thenedge) {
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




	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	//
	//											データ処理
	//
	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	Data_AddNewWaku_Next2Exist() {
		if (!this.data) {
			console.log('this.data == null');
			return;
		}
		if (this.data.candis.length == 0) {
			var dt_start	= new Date(this.data.sche_info.range_adjust.dtd_start);
			dt_start.setHours(12);
			dt_start.setMinutes(0);
		} else {
			var candi_editing	= this.data.candis[this.data.ope_info.index_editing]
			var dt_start		= new Date(candi_editing.dt_end);
		}
		var dt_end		= new Date(dt_start);
		dt_end.setMinutes(dt_end.getMinutes() + this.data.sche_info.min_needtime);
		var newcandi		= {}
		newcandi.dt_start	= dt_start;
		newcandi.dt_end		= dt_end;
//		this.Data_SaveNewCandi(newcandi)
		this.Data_AddNewWaku(newcandi, false);
	}

	Data_AddNewWaku(newcandi, editimode) {
		this.newwaku_visible	= true;
		this.newwku_editmode	= editimode;
		this.data.ope_info.newcandi	= newcandi;
		this.FocusArea('#id_new_date');
		this.CandisUpdated();		
	}

	Data_CancelNew() {
		$('#id_new_date').datepicker('hide');
		var app	= this;
		setTimeout(() => {
			app.Draw_CloseNewCandi();			
		}, 200);
	}

	Data_MakeNewCandiFromEl() {
		var newcandi	= {};
		var dtd	= $( "#id_new_date" ).datepicker('getDate');
		newcandi.dt_start	= new Date(dtd);
		newcandi.dt_end		= new Date(dtd);
		newcandi.dt_start.setHours(GetValueFromEle('#id_new_start_h'));
		newcandi.dt_start.setMinutes(GetValueFromEle('#id_new_start_m'));
		newcandi.dt_end.setHours(GetValueFromEle('#id_new_end_h'));
		newcandi.dt_end.setMinutes(GetValueFromEle('#id_new_end_m'));
		newcandi.newcandi	= true;		
		return newcandi;
	}

	Draw_DatepickerDelay_CandisUpdated(command) {
		$('#id_new_date').datepicker(command);
		var app	= this;
		setTimeout(() => {
			app.CandisUpdated();
		}, 200);
	}

	Data_DelCandi(index) {
		this.data.candis.splice(index, 1);
		this.SortCandis(this.data.candis);
		this.data.ope_info.index_editing	= 0;
		this.CandisUpdated();
	}

	Data_GetExists() {
		var exists	= []
		if (this.data && this.data.exists && this.data.exists.length != 0) {
			return this.data.exists;
		}
		for (var member of this.data.members) {
			for (var exist of member.exists) {
				exists.push(exist);
			}
		}
		return exists;
	}

	CandisUpdated() {
		this.UpdateWarning();
		this.DrawCandis();
		this.DrawCal_Candis();
		this.cb_change(this.data);
	}

	UpdateWarning() {
		this.data.ope_info.candis_warning	= '';
		for (var i = 0; i < this.data.candis.length - 1; i++) {
			var candi1	= this.data.candis[i];
			for (var j = i+1; j < this.data.candis.length; j++) {
				var candi2	= this.data.candis[j];
//				console.log(candi1, ' < ', candi2);
				if (candi2.dt_start < candi1.dt_end) {
					this.data.ope_info.candis_warning	= this.MakeWording('warning_conflict', {'candi_no1':i+1, 'candi_no2':j+1});
					return ;
				}
			}
		}
		for (var c in this.data.candis) {
			var candi	= this.data.candis[c]
			var diff	= candi.dt_end - candi.dt_start;
			diff		/= (60 * 1000);
			if (diff < this.data.sche_info.min_needtime) {
				this.data.ope_info.candis_warning	= this.MakeWording('nt_shortage_title', {'candi_no':parseInt(c)+1, 'needtime':this.data.sche_info.min_needtime});
				return;
			}
		}
	}




	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	//
	//												表示
	//
	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

	FocusArea(id_to_focus=null) {
		if (id_to_focus != null) {
			this.id_to_focus	= id_to_focus;
		}
		if (this.id_to_focus == null) {
			return;
		}
		var app	= this;
		setTimeout(() => {
			$(this.id_to_focus).focus();
			console.log('this.id_to_focus=', this.id_to_focus);
			if (app.newwaku_visible) {
				app.Draw_ShowDatePicker();
			}
		}, (100));
	}

	Draw_ShowDatePicker() {
		var options	= {};
		options.dateFormat		= this.options.dp_dateformat;
		options.dayNamesMin		= this.options.dp_daysofweek;
		options.dayNamesShort	= this.options.dp_daysofweek;
		options.firstDay		= 1;
		var app	= this;
		options.onSelect		= 
		function CB(str_date, obj_inst) {
			app.OP_DP_OnSelect(str_date, obj_inst);
		}
		$('#id_new_date').datepicker(options);
		var str_dt	= this.options.func_date2str(this.data.ope_info.newcandi.dt_start);
		$('#id_new_date').datepicker('setDate', str_dt)
		$('#id_new_date').datepicker('show')

	}

	SetCandiCb() {
		var app	= this;

		$('.btn_tooltip_list').on('mouseover',
			function (e) {
				app.OP_CanliList_BtnMouseEnterLeave(e, true);
			}
		)
		$('.btn_tooltip_list').on('mouseout',
			function (e) {
				app.OP_CanliList_BtnMouseEnterLeave(e, false);
			}
		)

		$('#id_textarea_title').on('click',
			function (e) {
				app.OP_ClickTitle(e);
			}
		)

		$('#id_textarea_title').on('keydown',
			function (e) {
				app.OP_KeyDownTitle(e);
			}
		)

		$('#id_textarea_title').on('keyup',
			function(e) {
				app.OP_KeyUpTitle(e);
			}
		)

		$('#id_min_needtime').on('click',
			function (e) {
				app.OP_ClickNeedMinInput(e);
			}
		)

		$('#id_min_needtime').on('keydown',
			function (e) {
				app.OP_KeyDownNeedMinInput(e);
			}
		)

		$('.td_candi_info').on('click',
			function (e) {
				app.OP_ClickCandi(e);
			}
		)

		$('.btns_list').on('click',
			function (e) {
				app.OP_ClickBtn_CandiList(e);
			}
		)

		$('#id_keydown_receiver').off('keydown');
			$('#id_keydown_receiver').on('keydown',
			function (e) {
				app.OP_Make_CandiList_Keydown(e);
			}
		)

		$('.cls_timeinput').on('keydown',
			function (e) {
				app.OP_KeyDownDateTimeInput(e);
			}
		)

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
		$('#id_td_left').append(dom_left)

		$('#id_candis_area').html('');
		var html_candis	= '<div class="candiboxes_body">';
		html_candis		+= '<table><tr><td id="id_td_candi_area">';
		html_candis		+= '<input type="text" id="id_keydown_receiver" class="cls_hideinput" readonly>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_candititle"></table>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_candineedmin"></table>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_candilist"></table>';
		html_candis		+= '<table class="cls_candis_tbl" id="id_tbl_newcandi"></table>';
		html_candis		+= '<table id="id_tbl_finalanswer"></table>';
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
		$('#id_td_right').append(dom_right)

		var el_cal_exists	= $('#' + CandisCommon.CALID_EXISTS)[0]
		var cal_exists		= new FullCalendar.Calendar(el_cal_exists, GetCalParams_MakeCandis(this));
		cal_exists.render();

		this.cal_exists		= cal_exists;
	}

	CalcWidths() {
		var width_all	= this.options.width;
		var widths		= {};
		widths.all		= width_all;
		widths.left	= parseInt(width_all * 2.5 / 10);
		var min_left	= 400;
		if (widths.left < min_left) {
			widths.left = min_left;
		}
		const margin_right	= 30;
		widths.right		= parseInt(width_all - widths.left - margin_right);
		widths.exists		= parseInt(widths.right * 9.9 / 10);

		const margin_candi	= 50;
		widths.candi_all	= widths.left - margin_candi;
		widths.needtime_title	= parseInt(widths.candi_all * 6.2 / 10);
		widths.needtime_value	= parseInt(widths.candi_all * 3.5 / 10);
		widths.list_btn	 	= this.options.width_list_btn;
		widths.list_label	= this.options.width_list_label;
		widths.list_dt		= widths.candi_all - widths.list_btn - widths.list_label - margin_candi;
		widths.list_new		= widths.candi_all - margin_candi;
		widths.new_addcan	= parseInt((widths.candi_all - margin_candi)/2)
		return widths;
	}

	CalcHeights() {
		var height_all	= this.options.height;
		var heights		= {};
		heights.title			= 40;
		heights.all				= height_all;
		heights.candis_area		= height_all;
		heights.calendarbody	= height_all - heights.title;
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
		if (!this.data) {
			return;
		}
		var htmls	= this.MakeHtml_CandisInfo();
		$('#id_tbl_candititle').html(htmls.header);
		$('#id_tbl_candineedmin').html(htmls.needmin);
		$('#id_tbl_candilist').html(htmls.candilist);
		$('#id_tbl_newcandi').html(htmls.newcandi);
		$('#id_tbl_explanation').html(htmls.explanation);
		this.DrawFinalAnswer();
		this.Draw_AnimateNewCandi();
		this.SetCandiCb();
		this.FocusArea();
	}

	Draw_AnimateNewCandi() {
		if (!this.data) {
			return;
		}
		for (var index in this.data.candis) {
			var candi	= this.data.candis[index]
			if (candi.newcandi) {
				candi.newcandi	= false;
				var div	= '#candi_' + index;
				console.log(candi.dt_start)
				$(div).css('backgroundColor', 'pink');
				$(div).animate(
					{
						backgroundColor: 'white'
					}, 3000
				);
			}
		}
	}

	DrawCal_AddExists() {
		if (!this.data) {
			return;
		}
		this.cal_exists.removeAllEvents();
		var exists	= this.Data_GetExists();
		for (var exist of exists) {
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
		this.DrawCal_AddCandis();
	}

	DrawCal_AddCandis() {
		if (!this.data) {
			return;
		}
		for (var c in this.data.candis) {
			var candi	= this.data.candis[c];
			var event	= {};
			event.title		= this.MakeWording('candititle', {'candi_no' : parseInt(c)+1});;
			event.start		= candi.dt_start.toISOString();
			event.end		= candi.dt_end.toISOString();
			event.color		= this.options.event_color_candi;
			event.display	= 'background';
			candi.orgtype	= 'candi';
			event.org		= candi;
			this.cal_exists.addEvent(event);
		}
		if (this.newwaku_visible) {
			var newcandi	= this.Data_MakeNewCandiFromEl();
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

	DrawCal_Candis() {
		var events	= this.cal_exists.getEvents();
		for (var event of events) {
			var sche	= event._def.extendedProps.org;
			if (sche.orgtype == 'candi') {
				event.remove();
			}
		}
		this.DrawCal_AddCandis();
	}

	DrawCal_MoveDay(dtd_arg) {
		if (this.dtd_cal && this.dtd_cal.getMonth() == dtd_arg.getMonth() && this.dtd_cal.getDate() == dtd_arg.getDate()) {
			return;
		}
		this.cal_exists.gotoDate(dtd_arg);
		this.dtd_cal	= dtd_arg
		//this.DrawCal_SetCalScrollPos();
	}
	
	/*
	DrawNewCandiHtml(dt_start, dt_end) {
	}

	ClearNewCandiHtml() {
	}
	*/

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
		var html_text	= '<textarea id="id_textarea_title" style="width:' + (widths.candi_all - 25) + 'px; height:20px;">' + this.data.sche_info.title + '</textarea>';
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
		html_candis		+= '<input readonly class="cls_needtime" id="id_min_needtime" value="' + this.data.sche_info.min_needtime + '"></input>';
		html_candis		+= '</td></tr>';
		return html_candis
	}

	MakeHtml_CandiList() {
		if (!this.data) {
			return ''

		}
		var widths			= this.widths;
		var css_hd			= ' style="background-color:' + this.options.title_color + '; ';
		css_hd				+= 'width:' + widths.candi_all + 'px; ';
		var html_candis		= '';
		html_candis			+= '<tr style="height:15px;"><td colspan="3"></td></tr>';
		var title_candi		= this.MakeWording('title_candi');
		html_candis			+= '<tr><th' + css_hd + '" align="center" colspan=3>' + title_candi + '</th>'
		html_candis			+= '</tr>';
		for (var c in this.data.candis) {
			var candi	= this.data.candis[c]
			html_candis		+= this.MakeHtml_1CandiInfo(candi, c);
		}
		if (this.data.ope_info.candis_warning != '') {
			html_candis		+= '<tr><td colspan="3" style="width:' + (widths.candi_all) + 'px; color:red;">' + this.data.ope_info.candis_warning +  '</td></tr>';;
		}
		if (!this.newwaku_visible) {
			var str_btn		= this.MakeWording('btn_newcandi_start');
			var btn_width	= 'style="width:' + widths.list_new + 'px;"'
			var html_btn	= '<a href="javascript:void(0);" class="btn_tooltip_list btn_kirari btn_kirari_green btns_list" id="id_btn_new"' + btn_width + '>' + str_btn + '</a>'
			html_candis		+= '<tr><td colspan="3" class="td_candi_info2">' + html_btn + '</td></tr>';
		}
		return html_candis;
	}

	MakeHtml_1CandiInfo(candi, index) {
		var btn_delcandi	= this.MakeWording('btn_delcandi');
		var widths		= this.widths;
		var html_candi	= '';
		var is_editing		= (this.data.ope_info.index_editing == parseInt(index)) ? true : false;
		var cls_waku		= (this.id_to_focus == '#id_keydown_receiver') ? 'cls_focus_' : 'cls_focusdtl_';
		var html_edit_tr	= (is_editing) ? 'class="' + cls_waku + 'tb"' : '';
		var html_edit_left	= (is_editing) ? cls_waku + 'left ' : '';
		var html_edit_right	= (is_editing) ? ' ' + cls_waku + 'right"' : '';
		html_candi		+= '<tr ' + html_edit_tr + ' id="candi_' + index + '">';
		var btn			= '<a style="width:' + widths.list_btn + 'px;" href="javascript:void(0);" class="btn_tooltip_list btn_kirari btn_kirari_red btns_list" id="id_btn_del">' + btn_delcandi + '</a>';
		html_candi		+= '<td class="td_candi_info2 ' + html_edit_left + '">' + btn + '</td>';
		var candititle	= this.MakeWording('candititle', {'candi_no' : (parseInt(index)+1)});
		html_candi		+= '<td class="td_candi_info ' + html_edit_tr + '" style="width:' + widths.list_label + 'px">' + candititle + '';
		html_candi		+= '<img class="btn_tooltip_list cls_btn_smalledit btns_list" id="id_btn_edit" src="' + GetEditMarkUrl() + '"/></td>';
		var str_dt		= this.options.func_date2str(candi.dt_start) + ' ' + GetTmStr(candi.dt_start) + '～' + GetTmStr(candi.dt_end)
		html_candi		+= '<td class="td_candi_info ' + html_edit_right + '" style="width:' + widths.list_dt + 'px">' + str_dt + '</td>';
		html_candi		+= '</tr>';
		return html_candi;

	}

	MakeHtml_NewCandi() {
		if (!this.newwaku_visible) {
			return ''
		}
		var html_newcandi	= '';
		var widths		= this.widths;
		var css_hd		= ' style="background-color:' + this.options.title_color + '; ';
		if (this.newwku_editmode) {
			var title_newcandi	= this.MakeWording('title_editcandi');
			var btn_complete	= this.MakeWording('btn_new_edit');
		} else {
			var title_newcandi	= this.MakeWording('title_newcandi');
			var btn_complete	= this.MakeWording('btn_new_add');
		}
		var btn_new_cancel	= this.MakeWording('btn_new_cancel');
		html_newcandi	+= '<tr style="height:15px;"><td colspan="2"></td></tr>';
		html_newcandi	+= '<tr><th colspan=2' + css_hd + 'width:'+ (widths.candi_all-10) + 'px;">' + title_newcandi + '</th></tr>';
		var newcandi	= this.data.ope_info.newcandi;
		var id_new	= 'id_new_';
		html_newcandi	+= '<tr id="newcandi">';
		html_newcandi	+= '<td colspan=2 class="td_candi_info2" style="width:' + (widths.candi_dt) + 'px">';
		html_newcandi	+= '<input type="text" style="width:95px;" class="cls_timeinput" id="' + id_new + 'date" value="' + '' + '"></input>';
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'start_h" value="' + newcandi.dt_start.getHours() + '"></input>';
		html_newcandi	+= '<label class="cls_timeinput">:</label>'
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'start_m" value="' + MinStr(newcandi.dt_start) + '"></input>';
		html_newcandi	+= '<label class="cls_timeinput">～</label>'
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'end_h" value="' + newcandi.dt_end.getHours() + '"></input>';
		html_newcandi	+= '<label class="cls_timeinput">:</label>'
		html_newcandi	+= '<input readonly class="cls_timeinput" id="' + id_new + 'end_m" value="' + MinStr(newcandi.dt_end) + '"></input>';
		html_newcandi	+= '<span style="color:red;" id="id_new_warning"></span>';
		html_newcandi	+= '</td>';
		html_newcandi	+= '</tr><tr>';
		html_newcandi	+= '<td class="td_candi_info2 cls_td_add_cancel">';
		html_newcandi	+= '<a href="javascript:void(0);" class="btn_tooltip_list btn_kirari_small btn_kirari_blue" id="id_btn_save" style="width:' + widths.new_addcan + 'px">' + btn_complete + '</a></td>';
		html_newcandi	+= '<td class="td_candi_info2 cls_td_add_cancel">';
		html_newcandi	+= '<a href="javascript:void(0);" class="btn_tooltip_list btn_kirari_small btn_kirari_gray" id="id_btn_cancel" style="width:' + widths.new_addcan + 'px">' + btn_new_cancel + '</a></td>';
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
		html_ex	+= '<tr style="height:15px;"><td colspan="2"></td></tr>';
		html_ex	+= '<tr><th' + css_hd + 'width:'+ (widths.candi_all-0) + 'px;">' + title_explanation + '</th></tr>';
		var ope_all	= this.MakeWording('ope_all');
		ope_all		+= '<span id="span_ope_tooltip"></span>'
		html_ex	+= '<tr><td>' + ope_all + '</td></tr>';
		return html_ex;
	}

	DrawUpdateEditingCandi() {
		var candi_target	= this.GetEditingCandi();
		if (candi_target == null) {
			console.log('candi_target == null');
			return;
		}
		this.DrawCal_MoveDay(candi_target.dt_start);
		this.DrawCandis();
	}

	GetEditingCandi() {
		for (var c in this.data.candis) {
			if (c == this.data.ope_info.index_editing) {
				return this.data.candis[c]
			}
		}
		console.log('ope_info.index_editing=', this.data.ope_info.index_editing, ', candis.length=', this.data.candis.length);
		alert('pls look at console log')
		return null;
	}

	Draw_CloseNewCandi() {
//		this.ClearNewCandiHtml();
		this.newwaku_visible	= false;
		this.id_to_focus		= '#id_keydown_receiver';
		this.DrawCal_Candis();
		this.DrawCandis();
	}

	DrawUpdateNewWarning() {
		var str_warning	= '';
		var newcandi	= this.Data_MakeNewCandiFromEl();
		for (var c in this.data.candis) {
			var candi	= this.data.candis[c];
			if (this.newwku_editmode && this.data.ope_info.index_editing == parseInt(c)) {
				continue;
			}
			if (newcandi.dt_end <= candi.dt_start || candi.dt_end <= newcandi.dt_start) {
				;
			} else {
				str_warning	= this.MakeWording('warning_conflict_new', {'candi_no':parseInt(c) + 1});
			}
		}
		var diff	= newcandi.dt_end - newcandi.dt_start;
		diff		/= (60 * 1000);
		if (diff < this.data.sche_info.min_needtime) {
			if (str_warning != '') {
				str_warning	+= '、'
			}
			str_warning	+= this.MakeWording('needtime_shortage', {'needtime':this.data.sche_info.min_needtime})
		}
		if (str_warning != '') {
			str_warning	= '<BR>' + str_warning
		}
		$('#id_new_warning').html(str_warning);
	}	

	DrawFinalAnswer() {
		if (!this.options.show_finalanswer || this.newwaku_visible) {
			$('#id_tbl_finalanswer').html('');
			return;
		}
		var html_finalannswer	= this.MakeHtml_FinalAnswer();
		$('#id_tbl_finalanswer').html(html_finalannswer);
		this.SetFinalAnswerCb();
	}

	MakeHtml_FinalAnswer() {
		var widths		= this.widths;
		var width_haba	= widths.candi_all - 10;
		var width_btn	= width_haba - 30;
		var html_fa		= '';
		html_fa			+= '<table>'
		html_fa			+= '<tr style="height:15px;"><td style="width:' + width_haba + 'px;">　</td></tr>';
		var title_finalanswer	= this.MakeWording('title_finalanswer');
		html_fa		+= '<td id="btn_finalanswer" style="width:' + widths.candi_detail + 'px;" valign="center"><a href="javascript:void(0);" class="btn_tooltip_fa btn_kirari btn_kirari_blue" style="width:' + width_btn + 'px; height:40px; font-size:24px;">' + title_finalanswer + '</a></td></tr>';
		html_fa		+= '</table>';
		return html_fa;
	}

	SetFinalAnswerCb() {
		var app	= this;
		$('#btn_finalanswer').on('mouseover',
			function (e) {
				app.OP_FinalAnswer_Btn_MouseEnterLeave(e, true);
			}
		)
		$('#btn_finalanswer').on('mouseout',
			function (e) {
				app.OP_FinalAnswer_Btn_MouseEnterLeave(e, false);
			}
		)
		$('#btn_finalanswer').on('click',
			function (e) {
				app.OP_FinalAnswer_Btns_Click(e);
			}
		)
	}

	/*
	DrawCal_SetCalScrollPos() {
		if (!this.data || this.data.candis.length == 0) {
			return;
		}
		var candi			= this.GetEditingCandi();
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
	*/

}


function GetCalParams_MakeCandis(parent) {
	var params = 
	{
		initialView				: 'timeGridWeek',
		locale					: parent.options.calendar_locale,
		allDayText				: parent.options.cal_locale_allday,
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
			parent.OP_Cal_SpanSelect(info.start, info.end);

		},
		eventClick		: function(info) {
			var sche	= info.event._def.extendedProps.org;
			parent.OP_Cal_EventClick(sche);
		},
		eventMouseEnter	: function(info) {
			parent.OP_Cal_EventMouseEnter(info);
		},
		eventMouseLeave	: function(info) {
			parent.OP_Cal_EventMouseLeave(info);
		},
	}
	return params
}



function LoopPos(value, min, max) {
	if (value < min) {
		value	= max;
	} else if (max < value) {
		value	= min;
	}
	return value;
}



