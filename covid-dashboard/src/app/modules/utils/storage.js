function set(name, value) {
  window.localStorage.setItem(name, JSON.stringify(value));
}
function del(name) {
  localStorage.removeItem(name);
}

function get(name, subst = null) {
  let res;
  try {
    res = JSON.parse(window.localStorage.getItem(name) || subst);
  } catch (e) {
    res = subst;
    // del(name);
  }
  return res;
}

export default { set, get, del };
