let str = '/сложи -100, -50';
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
	if (f_el === '') { }
	else f_el = Number(f_el);

	//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	str = str.slice(i);

	for (j = 1; j < str.length; j++) {
		if (!isNaN(Number(str[j])) && str[j] != '-') break;
	}
	let s_el = str.slice(j);
	if (s_el === '') { }
	else s_el = Number(s_el);
	
	return [f_el, s_el];
}


var ar = eval2(str, 6);
ar.forEach(el => {
	console.log({ el });
});
console.log(Number(ar[0]) + Number(ar[1]));










