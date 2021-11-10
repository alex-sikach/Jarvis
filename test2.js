let str = '/сложи -100, 200';
// let i, j;
// for (i = 7; i < str.length; i++) {
// 	if (isNaN(Number(str[i])) || str[i] == '') break;
// }
// let f_el = str.slice(7, i);
// str = str.slice(i);
// for (j = 2; j < str.length; j++) {
// 	if (!isNaN(Number(str[j])) || str[j] == '') break;
// }
// let s_el = str.slice(j);
// console.log({ f_el, s_el });

function eval2(s, kw_length = 0) {
	let str = s;
	let i, j;
	for (i = kw_length + 1; i < str.length; i++) {
		if (( isNaN(Number(str[i])) && str[i] != '-' )) break;
	}
	let f_el = str.slice(kw_length+1, i);
	console.log({ f_el });
	if (f_el === '') { }
	else f_el = Number(f_el);
	str = str.slice(i);
	for (j = 2; j < str.length; j++) {
		if (!isNaN(Number(str[j])) || str[j] == '') break;
	}
	let s_el = str.slice(j);
	console.log({ s_el });
	if (s_el === '') { }
	else s_el = Number(s_el);
	console.log({ f_el, s_el });
	if (f_el === '' || s_el === '')
		return 'Wrong input!'
	else
		return [f_el, s_el];
}
console.log(eval2(str, 6));
var ar = eval2(str, 6);
console.log(Number(ar[0]) + Number(ar[1]));










