/*

	土曜を候補１にしたとき、select cal 表示おかしくなる？(候補3が表示)
	NG時間もselect cal に表示させる？

*/
class CandisCommon {
	static option_params	= [
		['WINSIZE',		'width',				1400],
		['WINSIZE',		'height',				800],
		['CONTENTS',	'slotsize',				15],
		['CONTENTS',	'starthour',			7],
		['CONTENTS',	'endhour',				20],
		['CONTENTS',	'min_needtime',			60],
		['CONTENTS',	'show_anwswerbtn',		true],
		['APPERANCE',	'event_color_exist',	'darkgreen'],
		['APPERANCE',	'event_color_candi',	'orange'],
		['APPERANCE',	'event_color_newcandi',	'yellow'],
		['APPERANCE',	'event_color_ok',		'royalblue'],
		['APPERANCE',	'calendar_locale',		'ja'],
		['APPERANCE',	'cal_locale_allday',	'終日予定'],
		['APPERANCE',	'title_color',			'lightcyan'],
		['APPERANCE',	'func_date2str',		GetDateStr],
		['WORDING',		'title_candi',			'候補日時一覧'],
		['WORDING',		'title_schedule',		'予定タイトル'],
		['WORDING',		'title_needtime',		'必要時間'],
		['WORDING',		'candititle',			'候補{{candi_no}}'],
		['WORDING',		'needtime_shortage',	'必要時間({{needtime}}分)未満です'],
		['WORDING',		'nt_shortage_title',	'候補{{candi_no}}が必要時間({{needtime}}分)未満です'],
		['WORDING',		'shortcut',				'ショートカット'],

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

	SortCandis(candis) {
		candis.sort(CB_SortDtStart);
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


function IsOverlapExist(oks) {
	for (var o = 0; o < oks-1; o--) {
		var ok1	= oks[o];
		var ok2	= oks[o + 1]
		if (IsOverlap(ok1, ok2)) {
			return ok1
		}
	}
	return null;
}
function IsNewOk_Overlap(candi, ok_new) {
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

function GetEditMarkUrl() {
	var url	= GetOwnUrl();
	url		+= 'image/btn_edit.png';
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
        var match = scripts[i].src.match(/(^|.*\/)ScheCandis_Common\.js$/); //sampleのところは自身のjsファイル名に変更する
        if (match) {
            url = match[1];
            break;
        }
        var match = scripts[i].src.match(/(^|.*\/)ScheCandis_Make\.js$/); //sampleのところは自身のjsファイル名に変更する
        if (match) {
            url = match[1];
            break;
        }
        var match = scripts[i].src.match(/(^|.*\/)ScheCandis_Sele\.js$/); //sampleのところは自身のjsファイル名に変更する
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

function EleValueChange_ByUpDown(id_el, min, max, movesize, zeroprefix, key_upper) {
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
	if (zeroprefix) {
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
		var zeroprefix	= false;
	} else {
		var max			= 55;
		var movesize	= 5;
		var zeroprefix	= true;
	}
	var value	= EleValueChange_ByUpDown(id_el, 0, max, movesize, zeroprefix, key_upper);

	if (h_m == 'm') {
		var add_hour	= 0;
		if (value == 0 && key_upper == 'ARROWDOWN') {
			add_hour	= 1;
		}
		if (value == 55 && key_upper == 'ARROWUP') {
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

function DeleteOkFromCandi(candi, index_delete) {
	candi.oks.splice(index_delete, 1);
	SortAndNumberOks(candi);
	JudgeCandiStatus(candi);
}

function SortAndNumberOks(candi) {
	candi.oks.sort(CB_SortDtStart);
	for (var o in candi.oks) {
		var ok	= candi.oks[o];
		ok.index	= parseInt(o);
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

function JudgeCandiStatus(candi, ng_if_zero=true) {
	if (candi.oks.length == 1 && IsSameTime(candi.oks[0].dt_start, candi.dt_start) && IsSameTime(candi.oks[0].dt_end, candi.dt_end)) {
		candi.status	= 'CANDI_STS_OK';
	} else if (candi.oks.length != 0) {
		candi.status	= 'CANDI_STS_PARTIAL';
	} else {
		if (ng_if_zero) {
			candi.status	= 'CANDI_STS_NG';
		}
	}
}



