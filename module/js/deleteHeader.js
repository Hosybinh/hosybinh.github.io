/***********************************************
> deleteHeader by duyvinh09 & KingOfLocket
***********************************************/
var modifiedHeaders = $request.headers || {};
for (var key in modifiedHeaders) {
    var lower = key.toLowerCase();
    if (lower === "if-none-match" || lower === "x-revenuecat-etag") {
        delete modifiedHeaders[key];
    }
}
$done({ headers: modifiedHeaders });
