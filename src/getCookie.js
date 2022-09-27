const getCookie = (req, name) => (req.getHeader('cookie')).match(getCookie[name] ??= new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`))?.[2]

module.exports = getCookie;
