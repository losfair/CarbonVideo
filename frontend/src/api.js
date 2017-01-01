import * as network from "./network.js";

export async function request(url, args) {
    let result;

    if(!args) args = {};

    try {
        result = await network.makeRequest(
            "POST",
            url,
            JSON.stringify(args), {
                "Content-Type": "application/json"
            }
        );
        if(!result) return null;
        result = JSON.parse(result);
    } catch(e) {
        return null;
    }

    return result;
}
