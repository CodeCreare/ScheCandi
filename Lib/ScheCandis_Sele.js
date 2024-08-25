class SeleCandis extends CandisCommon {
	static option_params	= [
		['WINSIZE',		'width_title',			180],
		['WINSIZE',		'width_status',			95],
		['WINSIZE',		'width_1touch',			150],
		['APPERANCE',	'show_finalanswer',		true],
		['WORDING',		'outof_canditime',		'候補日時をはみ出しています'],
		['WORDING',		'conf_needtime',		'必要な時間({{needtime}}分)未満の選択です。 候補全体({{time_start}}～{{time_end}})をOK登録しますか？'],
		['WORDING',		'conflict'		,		'時間が重複しています。'],
		['WORDING',		'needtime',				'{{needtime}}分'],
		['WORDING',		'title_status',			'ステータス'],
		['WORDING',		'title_detail',			'回答詳細'],
		['WORDING',		'title_1touch',			'ワンタッチ'],
		['WORDING',		'title_1t_ok',			'全OK'],
		['WORDING',		'title_1t_ng',			'全NG'],
		['WORDING',		'detail_description',	'{{time_start}}～{{time_end}}'],
		['WORDING',		'detail_allok',			'左記時間OK'],
		['WORDING',		'title_detail_area',	'候補{{candi_no}} [{{date}} {{time_start}}～{{time_end}}] の回答詳細'],
		['WORDING',		'title_addwaku',		'枠追加'],
		['WORDING',		'title_delwaku',		'当枠削除'],
		['WORDING',		'title_closedtl',		'詳細閉じる'],
		['WORDING',		'title_finalanswer',	'予定保存'],
		['WORDING',		'candilist_operation',	'※⇅:上下移動'],
		['WORDING',		'detail_operation',		'※⇅:時間操作、↔:入力欄移動(テキスト欄ではCtrl+↔)'],
		['WORDING',		'detail_operation2',	'　(カレンダー右側を時間選択でも可能)'],
		['WORDING',		'conf_delete',			'削除して良いですか？'],
	];

	constructor(div_drawarea, cb_change) {
		super();
		this.div_drawarea	= div_drawarea;
		this.cb_change		= cb_change;
		this.editing_detail	= false;
		this.InitOptions();
		this.InitDraw();
		this.SetScrollCb();

		//return;
		// Debug
		/*
		var app = this;
		setTimeout(() => {
			app.editing_detail=true;
			app.DrawCandis();
		}, (2000));
		*/
	}

	InitOptions() {
		super.InitOptions(SeleCandis.option_params);
	}

	GetOptionParams() {
		return SeleCandis.option_params;
	}

	SetData(data, targetname) {
		this.data		= data;
		this.targetname	= targetname;
		if (data.sche_info.min_needtime == null) {
			data.sche_info.min_needtime = this.options.min_needtime;
		}
		this.SortCandis(data.candis);
		var member		= this.GetTargetMember();
		member.candis	= [];
		for (var c in data.candis) {
			var candi_org	= data.candis[c];
			var candi			= {};
			candi.dt_start		= candi_org.dt_start;
			candi.dt_end		= candi_org.dt_end;
			candi.status		= 'CANDI_STS_UNKNOWN';
			candi.comment		= '';
			candi.oks_warning	= '';
			candi.oks			= (candi_org.oks && candi_org.oks.length != 0) ? candi_org.oks : [];
			member.candis.push(candi);
			SortAndNumberOks(candi);
			JudgeCandiStatus(candi, false);
		}
		data.ope_info.index_editing	= 0;
		this.editing_detail			= false;
		this.DrawCandis();
		this.DrawSelectCalendar();
		this.DrawExistCalendar();
		this.DrawCal_MoveDay();
	}


	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	//
	//												操作
	//
	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■

	//	■■■■■■■■■■■■■■■■■■■
	//					Window
	//	■■■■■■■■■■■■■■■■■■■
	OP_Window_Focus() {
		this.FocusArea();	
	}

	//	■■■■■■■■■■■■■■■■■■■
	//				　候補リスト
	//	■■■■■■■■■■■■■■■■■■■
	// btn_tooltip_list 
	OP_CanliList_BtnMouseEnterLeave(e, is_enter) {
		var jq_td		= $(e.target).parent();
		//var jq_tr		= jq_td.parent();
		var btnid		= jq_td.attr('id');
		//console.log(btnid, is_enter);
		var str_tooltip	= this.MakeWording('shortcut') + '=';

		if (btnid == 'quickbtn_ok') {
			str_tooltip	+= 'ctrl + o'
		} else if (btnid == 'quickbtn_ng') {
			str_tooltip	+= 'ctrl + n'
		} else if (btnid == 'btn_edit') {
			str_tooltip	+= 'ctrl+g / Enter'
		}
		if (!is_enter) {
			str_tooltip	= ''
		}
		var html_tooltip	= '　<font style="color:blue;">' + str_tooltip + '</font>';
		$('#span_ope_tooltip_list').html(html_tooltip);
	}

	// id_candilist
	OP_CandiList_Keydown(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if (['ARROWUP', 'ARROWDOWN', 'ENTER'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				this.Op_Keydown_CandiList_UD(key_upper);
			} else if (key_upper == 'ENTER') {
				this.DrawEditStart()
			}
		}
		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			if (['O', 'G', 'E', 'F'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (key_upper == 'O' || key_upper == 'G') {
				var is_ok		= (key_upper == 'O') ? true : false ; 
				var candi		= this.GetEditingCandi();
				this.SetAllOkNg(candi, is_ok);
			} else if (key_upper == 'E') {
				this.DrawEditStart()
			} else if (key_upper == 'F') {
				this.cb_change(this.data, true);
			}
		}
		if (e.altKey && e.shiftKey && e.ctrlKey) {
			if (key_upper == 'ENTER') {
				e.preventDefault();
				this.cb_change(this.data, true);
			}
		}
	}

	// .td_candi_info
	OP_CandiList_ClickCandi(e) {
		var jq_tr		= $(e.target).parent();
		var candi_id	= jq_tr.attr('id');
		var member		= this.GetTargetMember();
		for (var c in member.candis) {
			if ('candi_' + c == candi_id) {
				var index	= parseInt(c);
				this.SetEditingIndex(index);
				break;
			}
		}
	}

	// .cls_btn_smalledit (btn_edit)
	OP_CandiList_ClickEdit(e) {
		var jq_td		= $(e.target).parent();
		var jq_tr		= jq_td.parent();
		var btnid		= jq_td.attr('id');
		var rowid		= jq_tr.attr('id');
		if (btnid != 'btn_edit') {
			return;
		}
		console.log('rowid=', rowid, 'btnid=', btnid);
		var member	= this.GetTargetMember();
		var candi	= this.GetTargetCandiFromRowid(member.candis, rowid)
		this.data.ope_info.index_editing	= candi.index;
		this.DrawEditStart();
	}

	// .btns_list (quickbtn_ok / quickbtn_ng)
	OP_CandiList_ClickOneTouchOkNg(e) {
		var jq_td		= $(e.target).parent();
		var jq_tr		= jq_td.parent();
		var btnid		= jq_td.attr('id');
		var rowid		= jq_tr.attr('id');
		var type_okng	= (btnid.indexOf('ok') != -1) ? true : false ;
		console.log('candi_id=', rowid, 'btnid=', btnid);
		var member	= this.GetTargetMember();
		var candi	= this.GetTargetCandiFromRowid(member.candis, rowid)
		this.SetAllOkNg(candi, type_okng)
	}


	//	■■■■■■■■■■■■■■■■■■■
	//				　候補詳細
	//	■■■■■■■■■■■■■■■■■■■
	// .cls_timeinput 
	OP_CandiDtl_Time_KeyDown(e) {
		var key_upper	= e.key.toUpperCase();
		if (['SHIFT', 'CONTROL', 'ALT'].indexOf(key_upper) != -1) {
			return;
		}

		var id_this		= $(e.target).attr('id');
		var str_params	= id_this.replace('id_ok_', '');
		var params		= str_params.split('_');
		var index		= parseInt(params[0]);
		var st_end		= params[1];
		var h_m			= params[2];

		if (!e.altKey && !e.shiftKey && e.ctrlKey) {
			if (['ARROWLEFT', 'ARROWRIGHT', 'D', 'DELETE', '-', 'A', '+'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (['ARROWLEFT', 'ARROWRIGHT'].indexOf(key_upper) != -1) {
				this.Op_KeyDownTimeInput_LR(index, st_end, h_m, key_upper);
			} else if (key_upper == 'A' || key_upper == '+') {
				this.AddOk();
			} else if (key_upper == 'D' || key_upper == '-' || key_upper == 'DELETE') {
				this.DelOk(index);
			}
		}
		if (!e.altKey && !e.shiftKey && !e.ctrlKey) {
			if (['ARROWLEFT', 'ARROWRIGHT', 'ARROWUP', 'ARROWDOWN', 'ESCAPE', 'ENTER'].indexOf(key_upper) != -1) {
				e.preventDefault();
			}
			if (['ARROWLEFT', 'ARROWRIGHT'].indexOf(key_upper) != -1) {
				this.Op_KeyDownTimeInput_LR(index, st_end, h_m, key_upper);
			} else if (['ARROWUP', 'ARROWDOWN'].indexOf(key_upper) != -1) {
				this.Op_KeyDownTimeInput_UD(index, st_end, h_m, key_upper);
			} else if (['ESCAPE', 'ENTER'].indexOf(key_upper) != -1) {
				this.DrawEditEnd();
			}
		}
	}

	// #id_textarea_comment
	OP_CandiDtl_Comment_KeyUp(e) {
		var candi		= this.GetEditingCandi();
		var key_upper	= e.key.toUpperCase();
		if (!e.altKey && !e.shiftKey && e.ctrlKey && ['ARROWLEFT', 'ARROWRIGHT'].indexOf(key_upper) != -1) {
			e.preventDefault();
			console.log('key_up=', key_upper)
			if (key_upper == 'ARROWLEFT') {
				var id_el	= '#id_ok_' + (candi.oks.length - 1) + '_end_m';
			} else {
				var id_el	= '#id_ok_0_start_h';
			}
			$(id_el).focus();
			return;
		}

		if (this.timer_id != null) {
			clearTimeout(this.timer_id);
		}
		var str_comment	= $('#id_textarea_comment').val();
		candi.comment	= str_comment;
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

	// btn_tooltip_dtl 
	OP_CandiDtl_Btn_MouseEnterLeave(e, is_enter) {
		var jq_td		= $(e.target).parent();
		//var jq_tr		= jq_td.parent();
		var btnid		= jq_td.attr('id');
		//console.log(btnid, is_enter);
		var str_tooltip	= this.MakeWording('shortcut') + '=';
		if (btnid == 'btn_wakuadd') {
			str_tooltip	+= 'ctrl + a'
		} else if (btnid == 'btn_delwaku') {
			str_tooltip	+= 'ctrl + d'
		} else if (btnid == 'btn_closedtl') {
			str_tooltip	+= 'Esc / Enter'
		}
		if (!is_enter) {
			str_tooltip	= ''
		}
		var html_tooltip	= '　<font style="color:blue;">' + str_tooltip + '</font>';
		$('#span_ope_tooltip_dtl').html(html_tooltip);
	}

	// .btns_dtl ()
	OP_CandiDtl_Btns_Click(e) {
		var jq_td		= $(e.target).parent();
		var jq_tr		= jq_td.parent();
		var btnid		= jq_td.attr('id');
		var rowid		= jq_tr.attr('id');
		console.log('candi_id=', rowid, 'btnid=', btnid);
		if (btnid == 'btn_wakuadd') {
			this.AddOk();
		} else if (btnid == 'btn_closedtl') {
			this.DrawEditEnd();
		} else if (btnid == 'btn_delwaku') {
			var str_params	= rowid.replace('id_ok_', '');
			var params		= str_params.split('_');
			var index		= parseInt(params[0]);
			this.DelOk(index);
		}
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
		$('#span_ope_tooltip_list').html(html_tooltip);
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


	//	■■■■■■■■■■■■■■■■■■■
	//				カレンダー
	//	■■■■■■■■■■■■■■■■■■■
	OP_Cal_SyncScroll(jq_calendar_area_moved) {
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

	OP_Cal_SpanSelect(dt_start, dt_end) {
		if (this.data.candis.length == 0) {
			return;
		}
		var candi	= this.GetEditingCandi();
		if (IsOutOfCanditime(candi, dt_start, dt_end)) {
			var str_wording	= this.MakeWording('outof_canditime');
			alert(str_wording);
			this.cal_selects.unselect();
			return;
		}
		var ok_new		= {};
		ok_new.dt_start	= new Date(dt_start);
		ok_new.dt_end	= new Date(dt_end);
		var ms_diff		= dt_end - dt_start;
		var min_diff	= ms_diff / 1000 / 60;
		if (IsNewOk_Overlap(candi, ok_new)) {
			candi.oks.push(ok_new);
			MergeOks(candi);
		} else if (min_diff < this.data.sche_info.min_needtime) {
			var str_wording	= this.MakeWording('conf_needtime', {'needtime':this.data.sche_info.min_needtime, 'time_start':GetTmStr(candi.dt_start), 'time_end':GetTmStr(candi.dt_end)});
			var conf_all	= confirm(str_wording);
			if (conf_all) {
				ok_new		= {};
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

	OP_Cal_EventClick(sche_clicked) {
		if (sche_clicked.orgtype == 'exist') {
			window.open(sche_clicked.url);
		} else {
			var member	= this.GetTargetMember();
			for (var c in member.candis) {
				var candi	= member.candis[c];
				for (var o in candi.oks) {
					var ok	= candi.oks[o];
					if (sche_clicked.dt_start.getTime() == ok.dt_start.getTime()) {
						var str_conf_delete	= this.MakeWording('conf_delete')
						var conf	= confirm(str_conf_delete);
						if (conf) {
							o	= parseInt(o);
							DeleteOkFromCandi(candi, o)
							//this.DrawDeleteOk(candi, o);
							this.CandisUpdated();
						}
						return;
					}
				}
			}
		}
	}


	//	■■■■■■■■■■■■■■■■■■■
	//				操作系 - 内部関数
	//	■■■■■■■■■■■■■■■■■■■
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
		this.SetEditingIndex(index);
	}

	Op_KeyDownTimeInput_LR(index, st_end, h_m, key_upper) {
		var prefix	= '#id_ok_' + index + '_';
		var result	= super.Op_KeyDownTimeInput_LR(prefix, st_end, h_m, key_upper, true);
		if (result.edge_detect != 0) {
			index	+= result.edge_detect;
			var candi	= this.GetEditingCandi();
			if (index < 0) {
				$('#id_textarea_comment').focus();
			}
			if (candi.oks.length <= index) {
				$('#id_textarea_comment').focus();
			}
			var id_el	= '#id_ok_' + index + '_' + result.id_new;
			$(id_el).focus();
		} else {
			var id_el	= result.id_new;
		}
		this.id_to_focus	= id_el;
	}
	Op_KeyDownTimeInput_UD(index, st_end, h_m, key_upper) {
		var prefix	= '#id_ok_' + index + '_';
		EleValueChange_ByUpDown_HourMin(prefix, st_end, h_m, key_upper);
		this.DATA_UpdateOksTimeFromInput();
		var candi	= this.GetEditingCandi();
		this.OksUpdated(candi, true);
	}




	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	//
	//											データ処理
	//
	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	GetTargetCandiFromRowid(candis, rowid) {
		for (var c in candis) {
			var candi	= candis[c]
			if ('candi_' + c == rowid) {
				return candi;
			}
		}
		console.log('candis=', candis, ', rowid=', rowid);
		alert('check console!');
	}

	SetEditingIndex(index) {
		this.data.ope_info.index_editing	= index;
		this.DrawUpdateEditingCandi();
	}

	SetScrollCb() {
		console.log('SetScrollCb');
		var app	= this;
		setTimeout(() => {
			$('.cls_calendar_area').scroll(
				function (event) {
					var jq_calendar_area	= $(event.target)
					app.OP_Cal_SyncScroll(jq_calendar_area);
				}
			);
		}, 100);
	}

	OksUpdated(candi, keep_detail_focus=false) {
		this.CheckOkWarning();
		SortAndNumberOks(candi);
		JudgeCandiStatus(candi);
		this.CandisUpdated(keep_detail_focus);
	}

	CandisUpdated(keep_detail_focus=false) {
		this.DrawCandis(keep_detail_focus);
		this.DrawSelectCalendar();
		this.cb_change(this.data);
	}

	SetAllOkNg(candi, type_okng) {
		if (candi == null) {
			console.log('candi == null');
			return;
		}
		if (type_okng) {
			var ok_new			= {};
			ok_new.dt_start		= new Date(candi.dt_start);
			ok_new.dt_end		= new Date(candi.dt_end);
			candi.oks	= [ok_new]
			candi.status	= 'CANDI_STS_OK'
		} else {
			candi.oks	= []
			candi.status	= 'CANDI_STS_NG'
		}
		SortAndNumberOks(candi);
		JudgeCandiStatus(candi);
		this.CandisUpdated();
	}

	SetIdToFocus(candi) {
		if (candi == null || candi.oks.length == 0) {
			this.id_to_focus	= '#id_candilist';
		} else {
			this.id_to_focus	= '#id_ok_0_start_h';
		}
		this.FocusArea();
	}

	FocusArea(id_to_focus=null) {
		if (id_to_focus != null) {
			this.id_to_focus	= id_to_focus;
		}
		if (this.id_to_focus == null) {
			return;
		}
		setTimeout(() => {
			$(this.id_to_focus).focus();
			console.log('this.id_to_focus=', this.id_to_focus);
		}, (100));
	}

	GetTargetMember() {
		for (var member of this.data.members) {
			if (member.name == this.targetname) {
				return member;
			}
		}
		console.log('this.targetname=', this.targetname, ',this.data.members.length=', this.data.members);
		alert('alert');
	}




	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	//
	//												表示
	//
	//	■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
	DrawCandis(keep_detail_focus=false) {
		if (this.data == null) {
			return;
		}
		this.DrawCandiList();
		if (this.editing_detail) {
			if (!keep_detail_focus) {
				this.DrawCandiDetail();
				this.FocusArea('#id_ok_0_start_h')
			} else {
				var candi	= this.GetEditingCandi();
				$('#warning').text(candi.oks_warning)
			}
		} else {
			this.DrawFinalAnswer();
			this.FocusArea('#id_candilist');
		}
	}

	DrawCandiList() {
		var html_candilist	= this.MakeHtml_CandiList();
		$('#id_td_candilist').html(html_candilist);
		this.SetCandiListCb();

	}

	DrawCandiDetail() {
		var html_detail	= this.MakeHtml_CandiDetail();
		$('#id_td_candidetail').html(html_detail);
		this.SetCandiDetailCb();
	}

	DrawFinalAnswer() {
		if (!this.options.show_finalanswer) {
			return;
		}
		var html_finalannswer	= this.MakeHtml_FinalAnswer();
		$('#id_td_candidetail').html(html_finalannswer);
		this.SetFinalAnswerCb();
	}

	SetCandiListCb() {
		var app	= this;
		$('.td_candi_info').on('click',
			function (e) {
				console.log('detail', e);
				app.OP_CandiList_ClickCandi(e);
			}
		)
		$('.cls_btn_smalledit').on('click',
			function (e) {
				app.OP_CandiList_ClickEdit(e);
			}
		)
		$('.btns_list').on('click',
			function (e) {
				app.OP_CandiList_ClickOneTouchOkNg(e);
			}
		)
		$('#id_candilist').on('keydown',
			function (e) {
				app.OP_CandiList_Keydown(e);
			}
		)
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

	}

	SetCandiDetailCb() {
		var app	= this;
		$('.cls_timeinput').on('keydown',
			function (e) {
				app.OP_CandiDtl_Time_KeyDown(e);
			}
		)
		$('#id_textarea_comment').on('keyup',
			function(e) {
				app.OP_CandiDtl_Comment_KeyUp(e);
			}
		)
//		$('.btn_tooltip_dtl').off('mouseover');
		$('.btn_tooltip_dtl').on('mouseover',
			function (e) {
				app.OP_CandiDtl_Btn_MouseEnterLeave(e, true);
			}
		)
//		$('.btn_tooltip_dtl').off('mouseout');
		$('.btn_tooltip_dtl').on('mouseout',
			function (e) {
				app.OP_CandiDtl_Btn_MouseEnterLeave(e, false);
			}
		)
		$('.btns_dtl').on('click',
			function (e) {
				app.OP_CandiDtl_Btns_Click(e);
			}
		)

	}

	SetFinalAnswerCb() {
		var app	= this;
//		$('.btn_tooltip_fa').off('mouseover');
		$('.btn_tooltip_fa').on('mouseover',
			function (e) {
				app.OP_FinalAnswer_Btn_MouseEnterLeave(e, true);
			}
		)
//		$('.btn_tooltip_fa').off('mouseout');
		$('.btn_tooltip_fa').on('mouseout',
			function (e) {
				app.OP_FinalAnswer_Btn_MouseEnterLeave(e, false);
			}
		)
		$('.btn_tooltip_fa').on('click',
			function (e) {
				app.OP_FinalAnswer_Btns_Click(e);
			}
		)
	}

	DrawSelectCalendar() {
		if (!this.data) {
			return;
		}
		this.cal_selects.removeAllEvents();
		var member	= this.GetTargetMember();
		for (var candi of member.candis) {
			var event	= {}
			event.title		= this.MakeWording('candititle', {'candi_no' : candi.index + 1});
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
		html_candis		+= '<table><tr><td id="id_td_candilist">';
		html_candis		+= '</td></tr><tr><td id="id_td_candidetail">';
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

		this.DrawCal_HideUpper();
		this.cal_exists		= cal_exists;
		this.cal_selects	= cal_selects;
	}

	SizeChanged() {
		console.log('SizeChanged');
		this.widths		= this.CalcWidths();
		this.heights	= this.CalcHeights();
		var widths	= this.widths;
		var heights	= this.heights;
		var str_log		= '[WIDTH]all=' + widths.all + ', left=' + widths.left + ', right=' + widths.right;
		str_log		+= ', exists=' + widths.exists + ', selects=' + widths.selects;
		str_log		+= ', candi_all=' + widths.candi_all + ', title=' + widths.title;
		str_log		+= ', candi_detail=' + widths.candi_detail + ', titlests=' + widths.titlests
		str_log		+= ', onebtn=' + widths.onebtn + ', onetouch=' + widths.onetouch + ', comment=' + widths.comment;
		str_log		+= ', [HEIGHT]all=' + heights.all + ', candis_area=' + heights.candis_area + ', calendarbody=' + heights.calendarbody;
		console.log(str_log);

		this.DrawSetWidths();
		this.DrawSetHeight();
		this.DrawCal_SetCalScrollPos();
		this.DrawCandis();
		this.DrawSelectCalendar();
		this.DrawExistCalendar();
	}

	AppearrenceChanged() {
		this.DrawCandis();
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
		var margin_list		= 80;
		var halfmargin		= 25;
		var btn_margin		= 10;
		widths.title		= this.options.width_title;
		widths.titlests		= this.options.width_title + this.options.width_status - halfmargin;
		widths.onebtn		= this.options.width_1touch - btn_margin;
		var width_btns		= widths.titlests + this.options.width_1touch + margin_list	;
		widths.candi_detail	= widths.candi_all - width_btns;
		widths.dtl_warning	= widths.candi_all - width_btns - margin_list;
		var margin_comment	= 10;
		widths.comment		= widths.candi_all - widths.onebtn - widths.titlests - widths.onebtn - margin_comment;
		return widths;
	}

	CalcHeights() {
		var heights		= {};
		heights.all		= this.options.height
		heights.title	= 40;
		heights.candis_area		= heights.all;
		heights.calendarbody	= heights.all - heights.title;
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

	MakeHtml_CandiList() {
		var html_candis		= '';
		var title_schedule	= this.MakeWording('title_schedule');
		var title_needtime	= this.MakeWording('title_needtime');
		var needtime		= this.MakeWording('needtime', {'needtime':this.data.sche_info.min_needtime});
		var title_candi		= this.MakeWording('title_candi');
		var title_status	= this.MakeWording('title_status');
		var title_detail	= this.MakeWording('title_detail');
		var title_1touch	= this.MakeWording('title_1touch');
		var widths			= this.widths;

		var margin_title	= 90;
		var width_title	= widths.candi_all - 180 - 120 - 100 - margin_title;
		var css_hd		= ' style="background-color:' + this.options.title_color + '; ';
		html_candis		+= '<input type="text" id="id_candilist" class="cls_hideinput" readonly>';
		html_candis		+= '<table class="cls_candis_tbl">';
		html_candis		+= '<tr style="height:1px;"><td colspan="4"></td></tr><tr>';
		html_candis		+= '<th' + css_hd + 'width:180px;">' + title_schedule + '</th>'
		html_candis		+= '<td style="width:' + width_title + 'px;">' + this.data.sche_info.title + '</td>';
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
		//var member		= this.data.members[0];
		var member	= this.GetTargetMember();
		for (var c in member.candis) {
			var candi	= member.candis[c]
			var is_editing	=  (parseInt(c) == this.data.ope_info.index_editing) ? true : false;
			candi.index		= parseInt(c);
			html_candis		+= this.MakeHtml_1Candi(candi, is_editing);
		}
		var candilist_operation	= this.MakeWording('candilist_operation');
		candilist_operation		+= '<span id="span_ope_tooltip_list"></span>'
		html_candis		+= '<tr><td colspan="6">' + candilist_operation + '</td></tr>';
		html_candis		+= '</table>';
		return html_candis;
	}

	MakeHtml_1Candi(candi, is_editing) {
		var title_1t_ok		= this.MakeWording('title_1t_ok');
		var title_1t_ng		= this.MakeWording('title_1t_ng');
		var widths			= this.widths;
		var html_td_detail	= 'style="width:' + widths.candi_detail + 'px;"'
		var html_candi		= '';
		var cls_waku		= (this.editing_detail) ? 'cls_focusdtl_' : 'cls_focus_';
		var html_edit_tr	= (is_editing) ? 'class="' + cls_waku + 'tb"' : '';
		var html_edit_left	= (is_editing) ? cls_waku + 'left ' : '';
		var html_edit_right	= (is_editing) ? 'class="' + cls_waku + 'right"' : '';
		html_candi		+= '<tr ' + html_edit_tr + ' id="candi_' + candi.index + '">';
		var candititle	= this.MakeWording('candititle', {'candi_no' : candi.index+1});
		html_candi		+= '<td id="btn_edit" class="td_candi_info ' + html_edit_left + '">' + candititle + '<br>';
		html_candi		+= '<img class="btn_tooltip_list cls_btn_smalledit" src="' + GetEditMarkUrl() + '"/></td>';
		html_candi		+= '<td class="td_candi_info">' + this.options.func_date2str(candi.dt_start) + '<br>';
		html_candi		+= GetTmStr(candi.dt_start) + '～' + GetTmStr(candi.dt_end) + '</td>';
		html_candi		+= '<td class="td_candi_info" align="center"><img class="cls_marubatu" src="' + GetStatusMarkUrl(candi) + '"/></td>';
		html_candi		+= '<td colspan="1" class="td_candi_info" ' + html_td_detail + '>';
		if (candi.status == 'CANDI_STS_OK') {
			var str_wording	= this.MakeWording('detail_allok');
			html_candi	+= str_wording + '<br>';
		} else {
			for (var o in candi.oks) {
				var ok	= candi.oks[o]
				var str_wording	= this.MakeWording('detail_description', {'time_start':GetTmStr(ok.dt_start), 'time_end':GetTmStr(ok.dt_end)});
				if (o != 0) {
					html_candi	+= ',　';
				}
				html_candi	+= str_wording;
			}
			if (candi.oks_warning != '') {
				html_candi	+= '<BR><font style="color:red;">※' + candi.oks_warning + '</font>' + '';
			}
	}
		html_candi		+= candi.comment + '</td>';
		html_candi		+= '<td id="quickbtn_ok" ' + '><a href="javascript:void(0);" class="btns_list btn_tooltip_list btn_kirari btn_kirari_blue">' + title_1t_ok + '</a></td>';
		html_candi		+= '<td id="quickbtn_ng" ' + html_edit_right + '><a href="javascript:void(0);" class="btns_list btn_tooltip_list btn_kirari btn_kirari_red">' + title_1t_ng + '</a></td>';
		html_candi		+= '</tr>';
		return html_candi;

	}

	MakeHtml_CandiDetail() {
		var candi		= this.GetEditingCandi();
		var html_dtl	= '<table class="cls_candis_tbl">'
		html_dtl		+= '<tr style="height:15px;"><td colspan=4></td></tr>';
		var widths		= this.widths;
		var str_date	= this.options.func_date2str(candi.dt_start);
		var params		= {'candi_no':candi.index+1, 'date':str_date, 'time_start':GetTmStr(candi.dt_start), 'time_end':GetTmStr(candi.dt_end)};
		var html_hd		= 'th colspan=4 style="background-color:' + this.options.title_color + 'px "';
		var title_detail_area	= this.MakeWording('title_detail_area', params);
		var title_addwaku		= this.MakeWording('title_addwaku');
		var title_closedtl		= this.MakeWording('title_closedtl');
		html_dtl		+= '<tr><' + html_hd + '>' + title_detail_area + '</th></tr>';
		for (var o in candi.oks) {
			var ok		= candi.oks[o];
			html_dtl	+= this.MakeHtml_1Ok(candi, ok, o);
		}
		if (candi.oks.length == 0) {
			html_dtl	+= '<input type="text" class="cls_timeinput cls_hideinput" id="id_ok_0_start_h" readonly>';
			html_dtl	+= '<tr><td colspan=4 id="btn_wakuadd" style="width:' + (widths.candi_all - 70) + 'px"><a href="javascript:void(0);" class="btns_dtl btn_tooltip_dtl btn_kirari btn_kirari_green">' + title_addwaku + '</a></td></tr>';
		}

		html_dtl	+= '<tr><td colspan=3><label id="warning" style="color:red;">' + candi.oks_warning + '</label></td>'
		html_dtl	+= '<td id="btn_closedtl" style="width:' + widths.onetouch + 'px"><a href="javascript:void(0);" class="btns_dtl btn_tooltip_dtl btn_kirari btn_kirari_gray">' + title_closedtl + '</a></td></tr>';
		var detail_operation	= this.MakeWording('detail_operation');
		var detail_operation2	= this.MakeWording('detail_operation2');
		detail_operation	+= '<span id="span_ope_tooltip_dtl"></span>'
		detail_operation	+= '<BR>' + detail_operation2;
		html_dtl		+= '<tr><td colspan=4>' + detail_operation + '</td></tr>';
		html_dtl		+= '</table>';
		return html_dtl;

	}

	MakeHtml_1Ok(candi, ok, index) {
		var widths			= this.widths;
		var title_delwaku	= this.MakeWording('title_delwaku');
		var title_addwaku	= this.MakeWording('title_addwaku');
		var id_ok		= 'id_ok_' + index + '_'
		var html_1ok	= '';
		html_1ok	+= '<tr id=' + id_ok + '>'
		html_1ok	+= '<td id="btn_delwaku" style="width:' + widths.onetouch + 'px;"><a href="javascript:void(0);" class="btns_dtl btn_tooltip_dtl btn_kirari btn_kirari_red">' + title_delwaku + '</a></td>'
		html_1ok	+= '<td style="width:' + widths.titlests + 'px;">'
		html_1ok	+= '<label>' + this.options.func_date2str(ok.dt_start) + '</label>'
		html_1ok	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'start_h" value="' + ok.dt_start.getHours() + '"></input>'
		html_1ok	+= '<label class="cls_timeinput">:</label>'
		html_1ok	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'start_m" value="' + MinStr(ok.dt_start) + '"></input>'
		html_1ok	+= '<label class="cls_timeinput">～</label>'
		html_1ok	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'end_h" value="' + ok.dt_end.getHours() + '"></input>'
		html_1ok	+= '<label class="cls_timeinput">:</label>'
		html_1ok	+= '<input readonly class="cls_timeinput" id="' + id_ok + 'end_m" value="' + MinStr(ok.dt_end) + '"></input>'
		html_1ok	+= '</td>'
		if (index == '0') {
			var html_row	= ' rowspan=' + candi.oks.length + ' '
			var h_wakus		= 25 + (42 * (candi.oks.length-1))
			var br_wakus	= ''
			var loop		= candi.oks.length - 1;
			if (4 <= candi.oks.length) {
				loop--;
			}
			for (var i = 0; i < loop; i++ ){
				br_wakus	+= '<BR>'
			}
			html_1ok	+= '<td ' + html_row + '><textarea id="id_textarea_comment" style="width:' + (widths.comment) + 'px; height:' + h_wakus + 'px;"></textarea></td>';
			html_1ok	+= '<td ' + html_row + ' id="btn_wakuadd" style="width:' + widths.onetouch + 'px;"><a href="javascript:void(0);" class="btns_dtl btn_tooltip_dtl btn_kirari btn_kirari_green" style="height:' + h_wakus + 'px;">' + br_wakus + title_addwaku + '</a></td>';
		}
		html_1ok	+= '</tr>'
		return html_1ok;
	}

	MakeHtml_FinalAnswer() {
		var widths		= this.widths;
		var width_haba	= widths.candi_all - 60;
		var width_btn	= width_haba - 200;
//		var html_fa		= '<input type="text" id="id_finalanswer" class="cls_hideinput" readonly>';
		var html_fa		= '';
		html_fa			+= '<table>'
		html_fa			+= '<tr style="height:15px;"><td style="width:' + width_haba + 'px;">　</td></tr>';
		var title_finalanswer	= this.MakeWording('title_finalanswer');
		html_fa		+= '<td id="btn_finalanswer" style="width:' + widths.candi_detail + 'px;" valign="center"><a href="javascript:void(0);" class="btns_dtl btn_tooltip_fa btn_kirari btn_kirari_blue" style="width:' + width_btn + 'px; height:120px;"><BR><BR>' + title_finalanswer + '</a></td></tr>';
		html_fa		+= '</table>';
		return html_fa;

	}

	DrawCal_MoveDay() {
		var index	= this.data.ope_info.index_editing;
		var dt		= this.data.candis[index].dt_start;
		var dtd		= new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
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
		this.DrawCal_HideUpper();
		this.DrawCal_SetCalScrollPos()
	}
	
	DrawCal_HideUpper() {
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

	DrawEditStart() {
		this.editing_detail	= true;
		this.SetStatusNg_IfOkEmpty();
		this.DrawCandiList();
		this.DrawCandiDetail();
		this.FocusArea('#id_ok_0_start_h');
	}

	DrawEditEnd() {
		this.editing_detail	= false;
		this.DrawCandis();
	}

	DrawUpdateEditingCandi() {
		var candi_target	= this.GetEditingCandi();
		if (candi_target == null) {
			console.log('candi_target == null');
			return;
		}
		this.DrawCal_MoveDay(candi_target.dt_start);
		this.editing_detail	= false;
		this.DrawCandis();
	}

	AddOk() {
		var candi	= this.GetEditingCandi();
		var ok_new	= {};
		if (candi.oks.length != 0) {
			ok_new.dt_start	= new Date(candi.oks[candi.oks.length-1].dt_end);
		} else {
			ok_new.dt_start	= new Date(candi.dt_start);
		}
		ok_new.dt_end	= new Date(ok_new.dt_start);
		ok_new.dt_end.setMinutes(ok_new.dt_end.getMinutes() + this.data.sche_info.min_needtime);
		candi.oks.push(ok_new);
		this.OksUpdated(candi);
	}

	DelOk(index) {
		var candi	= this.GetEditingCandi();
		//this.DrawDeleteOk(candi, no-1);
		DeleteOkFromCandi(candi, index)
		this.OksUpdated(candi);
	}

	GetEditingCandi() {
		var member	= this.GetTargetMember();
		for (var c in member.candis) {
			if (c == this.data.ope_info.index_editing) {
				return member.candis[c]
			}
		}
		console.log('ope_info.index_editing=', this.data.ope_info.index_editing, ', candis.length=', member.candis.length);
		alert('pls look at console log')
		return null;
	}

	CheckOkWarning() {
		var candi	= this.GetEditingCandi();
		candi.oks_warning	= '';
		for (var o in candi.oks) {
			var ok	= candi.oks[o];
			var ok2	= candi.oks[parseInt(o)+1]
			var milli_diff	= ok.dt_end.getTime() - ok.dt_start.getTime();
			var min_diff	= milli_diff / 1000 / 60;
			var str_span	= '[' + this.MakeWording('detail_description', {'time_start':GetTmStr(ok.dt_start), 'time_end':GetTmStr(ok.dt_end)}) + ']';
			if (min_diff < this.data.sche_info.min_needtime) {
				candi.oks_warning	= str_span + this.MakeWording('needtime_shortage', {'needtime':this.data.sche_info.min_needtime});
			} else if (IsOutOfCanditime(candi, ok.dt_start, ok.dt_end)) {
				candi.oks_warning	= str_span + this.MakeWording('outof_canditime');
			} else if (parseInt(o) < candi.oks.length-1 && IsOverlap(ok, ok2)) {
				candi.oks_warning	= str_span + this.MakeWording('conflict');
			}
		}
	}

	SetStatusNg_IfOkEmpty() {
		var candi	= this.GetEditingCandi();
		if (candi.oks.length == 0 && candi.status == 'CANDI_STS_UNKNOWN') {
			candi.status = 'CANDI_STS_NG'
		}
	}

	DATA_UpdateOksTimeFromInput() {
		var candi	= this.GetEditingCandi();
		for (var o in candi.oks) {
			var ok	= candi.oks[o];
			for (var st_end of ['start', 'end']) {
				var id_el_hour	= '#id_ok_' + o + '_' + st_end + '_h';
				var id_el_min	= '#id_ok_' + o + '_' + st_end + '_m';
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

}




function GetCalParams_SeleCandis(parent) {
	var params = 
	{
		initialView				: 'timeGridDay',
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
				parent.OP_Cal_SpanSelect(info.start, info.end);
			} else {
				this.unselect();
			}
		},
		eventClick		: function(info) {
			var sche	= info.event._def.extendedProps.org;
			parent.OP_Cal_EventClick(sche);
		},
		eventMouseEnter	: function(info) {
		},
		eventMouseLeave	: function(info) {
		},
	}
	return params
}




