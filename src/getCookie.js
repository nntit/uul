const getCookie = (req, name) => {
    return get_cookie(req, name)
}
const get_cookie = (req, name) => (req.cookies ??= req.getHeader('cookie')).match(get_cookie[name] ??= new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`))?.[2]

module.exports = getCookie;
