export function escapeStringForHtml(s) {
    let ret = "";
    for(let i = 0; i < s.length; i++) {
        let v = s[i];
        if(v == "\n") ret += "<br>";
        else if(v == "<") ret += "&lt;";
        else if(v == ">") ret += "&gt;";
        else if(v == "&") ret += "&amp;";
        else ret += v;
    }
    return ret;
}
