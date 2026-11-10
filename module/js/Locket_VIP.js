// ========= ID ========= //
const mapping = {
  'Locket': ['Gold'],
  'locket': ['Gold']
};
// =========   Phần cố định  ========= // 
// =========  @LocketGod ========= // 
var headers = ($request && $request.headers) || {};
var ua = headers["User-Agent"] || headers["user-agent"] || "";
var obj = {};
try {
  obj = JSON.parse(($response && $response.body) || "{}");
} catch (e) {
  obj = {};
}
if (!obj || typeof obj !== "object") obj = {};
if (!obj.subscriber || typeof obj.subscriber !== "object") {
  obj.subscriber = {};
}
if (!obj.subscriber.subscriptions || typeof obj.subscriber.subscriptions !== "object") {
  obj.subscriber.subscriptions = {};
}
if (!obj.subscriber.entitlements || typeof obj.subscriber.entitlements !== "object") {
  obj.subscriber.entitlements = {};
}

obj.Attention = "Đã kích hoạt bản quyền Gold vĩnh viễn!";

var locketGod = {
  auto_resume_date: null,
  display_name: "locket_1600_1y",
  is_sandbox: true,
  ownership_type: "PURCHASED",
  billing_issues_detected_at: null,
  management_url: "https://apps.apple.com/account/subscriptions",
  period_type: "normal",
  price: {
    amount: 399000.0,
    currency: "VND"
  },
  expires_date: "9999-03-14T10:10:14Z",
  grace_period_expires_date: null,
  refunded_at: null,
  unsubscribe_detected_at: null,
  original_purchase_date: "2009-03-14T10:10:15Z",
  purchase_date: "2009-03-14T10:10:14Z",
  store: "app_store",
  store_transaction_id: "2000001108724193"
};

var locketGold = {
  grace_period_expires_date: null,
  purchase_date: "2009-03-14T10:10:14Z",
  product_identifier: "locket_1600_1y",
  expires_date: "9999-05-03T10:10:14Z"
};

obj.subscriber.subscriptions["locket_1600_1y"] = locketGod;
obj.subscriber.entitlements["Gold"] = locketGold;

const match = Object.keys(mapping).find(e => ua.includes(e));
if (match) {
  let [e, s] = mapping[match];
  if (s) {
    locketGold.product_identifier = s;
    obj.subscriber.subscriptions[s] = locketGod;
  }
  obj.subscriber.entitlements[e] = locketGold;
} else {
  obj.subscriber.entitlements.pro = locketGold;
}

$done({
  body: JSON.stringify(obj)
});
