// ============================================================
// Locket Photobooth Sequential Engine & AI Filter Interceptor
// Hỗ trợ: Shadowrocket, Surge, Loon, Egern, LanceX
// King of Locket Gold Edition - @long788
// ============================================================

(function () {
    const PHOTOBOOTH_PROMPT_MAP = {
        // 4-Cut Photobooth frames (Khung 4 ô vuông tuần tự chuẩn)
        "frame_berry_days": "pb_strawberry 4cut",
        "pb_strawberry 4cut": "pb_strawberry 4cut",
        "pb_strawberry": "pb_strawberry 4cut",

        "frame_happy_snap": "pb_vintage 4cut",
        "pb_vintage 4cut": "pb_vintage 4cut",
        "pb_vintage": "pb_vintage 4cut",

        "frame_sky_diary": "pb_galaxy 4cut",
        "pb_galaxy 4cut": "pb_galaxy 4cut",
        "pb_galaxy": "pb_galaxy 4cut",

        "photobooth_4cut": "photobooth_4cut",
        "pb_xmas_polaroid": "pb_xmas_polaroid",
        "pb_xmas_window": "pb_xmas_window",
        "pb_xmas_classic": "pb_xmas_classic",
        "pb_xmas_ornaments": "pb_xmas_ornaments",
        "pb_gingerbread_house": "pb_gingerbread_house",
        "pb_scrapbook_ripped_4cut": "pb_scrapbook_ripped_4cut",
        "pb_ripped_paper_4cut": "pb_ripped_paper_4cut",
        "pb_holo_4cut": "pb_holo_4cut",
        "pb_denim_ripped_2x2": "pb_denim_ripped_2x2 4cut",
        "pb_denim_ripped_2x2 4cut": "pb_denim_ripped_2x2 4cut",

        // 2-cut & film photobooth frames
        "photobooth_cute": "photobooth_cute",
        "photobooth_2": "photobooth_cute",
        "photobooth_film": "photobooth_film",
        "frame_classic_pb": "photoboot",
        "photoboot": "photoboot"
    };

    const STICKER_ID_MAP = {
        "stk_dio_pm2": "locket",
        "stk_dio_cash": "cash_money",
        "stk_dio_wedding": "flower_crown",
        "stk_dio_bearded_holiday": "bearded",
        "stk_dio_looksmaxing": "looksmaxing",
        "stk_dio_influencer": "influencer",
        "stk_dio_toothless": "toothless",
        "stk_dio_orange_wig": "orange_wig",
        "stk_dio_bye_brows": "bye_brows",
        "stk_dio_braces": "braces",
        "stk_dio_tatted": "tatted",
        "stk_dio_bearded": "bearded",
        "stk_dio_buns": "buns",
        "stk_dio_mohawk": "mohawk",
        "stk_dio_bob": "bob",
        "stk_dio_bowling_ball": "bowling_ball",
        "stk_dio_bleached_hair": "bleached_hair",
        "stk_dio_princess": "princess",
        "stk_dio_slimed": "slimed",
        "stk_dio_happy_birthday": "happy_birthday",
        "stk_dio_disco": "disco",
        "stk_dio_flower_crown": "flower_crown",
        "stk_dio_cutesy": "cutesy",
        "stk_dio_sticker_face": "sticker_face",
        "stk_dio_love_bug": "love_bug",
        "stk_dio_cowboy": "cowboy",
        "stk_dio_giraffe": "giraffe",
        "stk_dio_clown": "clown",
        "stk_dio_sweat_hearts": "sweat_hearts",
        "stk_dio_frosty": "frosty",
        "stk_dio_elf": "elf",
        "stk_dio_santa": "santa",
        "stk_dio_easter_bunny": "easter_bunny",
        "stk_dio_leprechaun": "leprechaun",
        "stk_dio_easter_chick": "easter_chick",
        "stk_dio_lucky_face": "lucky_face"
    };

    let memStore = {};
    function storeRead(key) {
        try {
            if (typeof $persistentStore !== "undefined" && $persistentStore.read) {
                const val = $persistentStore.read(key);
                if (val) return val;
            }
            if (typeof $prefs !== "undefined" && $prefs.valueForKey) {
                const val = $prefs.valueForKey(key);
                if (val) return val;
            }
        } catch (e) {}
        return memStore[key] || "";
    }

    function storeWrite(key, val) {
        memStore[key] = String(val);
        try {
            if (typeof $persistentStore !== "undefined" && $persistentStore.write) {
                $persistentStore.write(String(val), key);
            } else if (typeof $prefs !== "undefined" && $prefs.setValueForKey) {
                $prefs.setValueForKey(String(val), key);
            }
        } catch (e) {}
    }

    function getDeviceIpPrefix() {
        let prefix = storeRead("LOCKET_PB_IP_PREFIX");
        if (!prefix || prefix.split(".").length !== 3) {
            const o2 = Math.floor(Math.random() * 200) + 20;
            const o3 = Math.floor(Math.random() * 200) + 20;
            prefix = "100." + o2 + "." + o3;
            storeWrite("LOCKET_PB_IP_PREFIX", prefix);
        }
        return prefix;
    }

    function setAllUrls(resObj, newUrl) {
        if (!resObj || !newUrl) return;
        const fields = ["outputUrl", "output_url", "url", "imageUrl", "image_url"];
        const targets = [
            resObj,
            resObj.result,
            resObj.result && resObj.result.data,
            resObj.data
        ];
        for (let t = 0; t < targets.length; t++) {
            const obj = targets[t];
            if (obj && typeof obj === "object") {
                for (let f = 0; f < fields.length; f++) {
                    obj[fields[f]] = newUrl;
                }
            }
        }
    }

    function applySessionHeaders(headers, mappedPrompt) {
        const prefix = getDeviceIpPrefix();
        const lastTimeKey = "LOCKET_PB_TIME_" + mappedPrompt;
        const sessKey = "LOCKET_PB_SESS_" + mappedPrompt;
        const lastTime = parseInt(storeRead(lastTimeKey) || "0");
        const now = Date.now();
        let sess = parseInt(storeRead(sessKey) || "1");
        if (now - lastTime > 180000) {
            sess = (sess % 500) + 1;
            storeWrite(sessKey, sess);
        }
        storeWrite(lastTimeKey, now);

        let hash = 0;
        for (let i = 0; i < mappedPrompt.length; i++) hash = (hash * 31 + mappedPrompt.charCodeAt(i)) % 200 + 10;
        const clientIp = prefix + "." + ((hash + sess * 7) % 240 + 10);

        headers["X-Forwarded-For"] = clientIp;
        headers["CF-Connecting-IP"] = clientIp;
        headers["X-Real-IP"] = clientIp;
        headers["Host"] = "us-central1-locket-4252a.cloudfunctions.net";
    }

    // 1. HTTP-REQUEST MODE
    if (typeof $response === "undefined") {
        try {
            if (!$request) return $done({});
            const headers = Object.assign({}, $request.headers || {});
            headers["Host"] = "us-central1-locket-4252a.cloudfunctions.net";

            if (!$request.body) return $done({ headers: headers });

            const rawBodyStr = typeof $request.body === "string" ? $request.body : "";
            const trimmed = rawBodyStr.trim();

            // Trường hợp 1: Body dạng JSON
            if (trimmed.indexOf("{") === 0) {
                const reqObj = JSON.parse(rawBodyStr);
                const d = reqObj.data || reqObj;
                const fid = String((d && (d.filterId || d.prompt)) || "");
                const promptVal = String((d && d.prompt) || "");
                const filterIdVal = String((d && d.filterId) || "");

                const mappedPrompt =
                    PHOTOBOOTH_PROMPT_MAP[fid] ||
                    PHOTOBOOTH_PROMPT_MAP[filterIdVal] ||
                    PHOTOBOOTH_PROMPT_MAP[promptVal];

                if (mappedPrompt) {
                    d.prompt = mappedPrompt;
                    d.filterId = mappedPrompt;
                    applySessionHeaders(headers, mappedPrompt);
                    return $done({ headers: headers, body: JSON.stringify(reqObj) });
                }

                if (d && d.filterId && String(d.filterId).indexOf("stk_dio_") === 0) {
                    const rawFid = String(d.filterId);
                    const mappedStk = STICKER_ID_MAP[rawFid] || d.prompt || rawFid.replace(/^stk_dio_/, "");
                    d.filterId = mappedStk;
                    d.prompt = mappedStk;
                    return $done({ headers: headers, body: JSON.stringify(reqObj) });
                }

                return $done({ headers: headers, body: JSON.stringify(reqObj) });
            }

            // Trường hợp 2: Body dạng multipart/form-data (nhị phân ảnh)
            // Chỉ đọc tên khung để quản lý IP theo phiên chụp 4 ô, KHÔNG ghi đè body nhị phân
            if (rawBodyStr) {
                const keys = Object.keys(PHOTOBOOTH_PROMPT_MAP);
                for (let k = 0; k < keys.length; k++) {
                    if (rawBodyStr.indexOf(keys[k]) !== -1) {
                        applySessionHeaders(headers, PHOTOBOOTH_PROMPT_MAP[keys[k]]);
                        break;
                    }
                }
            }
            return $done({ headers: headers });
        } catch (e) {}
        return $done({});
    }

    // 2. HTTP-RESPONSE MODE
    try {
        if (!$response || !$response.body) return $done({});
        const resObj = JSON.parse($response.body);
        let outUrl =
            (resObj && resObj.result && resObj.result.outputUrl) ||
            (resObj && resObj.outputUrl) ||
            (resObj && resObj.result && resObj.result.data && resObj.result.data.outputUrl) ||
            (resObj && resObj.url) ||
            "";

        if (outUrl) {
            // Chuẩn hóa tất cả các trường URL để ứng dụng Locket mọi phiên bản đều nhận ảnh
            setAllUrls(resObj, outUrl);
            return $done({ body: JSON.stringify(resObj) });
        }
    } catch (e) {}

    return $done({});
})();
