import s from 'underscore.string';
import md5 from 'md5';

import { callbacks } from '../../../callbacks';

const generateKeyDefault = (...args) => args.map((item) => JSON.stringify(item)).join('-');

const mem = (fn, tm = 500, generateKey = generateKeyDefault) => {
	const cache = {};
	const timeout = {};

	const invalidateCache = (key) => delete cache[key];
	return (...args) => {
		const key = generateKey(...args);
		if (!key) {
			return fn(...args);
		}
		if (!cache[key]) {
			cache[key] = fn(...args);
		}
		if (timeout[key]) {
			clearTimeout(timeout[key]);
		}
		timeout[key] = setTimeout(invalidateCache, tm, key);
		return cache[key];
	};
};

export const renderMessageBody = mem((message) => {
	message.html = s.trim(message.msg) ? s.escapeHTML(message.msg) : '';

	const { tokens, html } = callbacks.run('renderMessage', message);

	return (Array.isArray(tokens) ? tokens.reverse() : [])
		.reduce((html, { token, text }) => html.replace(token, () => text), html);
}, 500, (message) => md5(JSON.stringify(message)));
