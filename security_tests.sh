#!/usr/bin/env bash
# آزمون‌های امنیتی «نوشتن» برای پروژهٔ Supabase خودتان — فقط روی پروژهٔ خودتان اجرا کنید.
# اجرا:  bash security_tests.sh        (روی Mac/Linux یا Git-Bash/WSL ویندوز؛ curl لازم است)
# هر آزمون یک خط PASS / FAIL می‌دهد. خروجی کامل را برای بررسی بفرستید.
SB="https://snhyzmwgazifdqyvqsnu.supabase.co"
KEY="${ANON_KEY:-PASTE_ANON_KEY_HERE}"      # یا:  ANON_KEY=eyJ... bash security_tests.sh
[ "$KEY" = "PASTE_ANON_KEY_HERE" ] && { echo "ANON_KEY را تنظیم کنید"; exit 1; }
H=(-H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json")
FAKE="11111111-1111-4111-8111-111111111111"
code(){ curl -s -o /tmp/sec_body -w "%{http_code}" "$@"; }
chk(){ # $1=عنوان  $2=کد  $3=کدهای قابل‌قبول (regex)
  if [[ "$2" =~ ^($3)$ ]]; then echo "PASS  $1  (HTTP $2)"; else echo "FAIL  $1  (HTTP $2)  → $(head -c 200 /tmp/sec_body)"; fi; }

echo "== ۱) نوشتن بدون ورود (anon)  — همه باید رد شوند (401/403/400/404)"
c=$(code -X POST "$SB/rest/v1/ads" "${H[@]}" -H "Prefer: return=minimal" \
  -d "{\"id\":\"sec-test-1\",\"owner_id\":\"$FAKE\",\"status\":\"approved\",\"data\":{\"t\":\"SECTEST\"}}")
chk "anon INSERT روی ads" "$c" "401|403|400|404|409"
[ "$c" = "201" ] && curl -s -X DELETE "$SB/rest/v1/ads?id=eq.sec-test-1" "${H[@]}" >/dev/null && echo "     (ردیف آزمایشی پاک شد)"

c=$(code -X PATCH "$SB/rest/v1/ads?status=eq.approved" "${H[@]}" -H "Prefer: return=representation" -d '{"status":"rejected"}')
if [ "$c" = "200" ] && [ "$(cat /tmp/sec_body)" != "[]" ]; then echo "FAIL  anon PATCH روی ads — ردیف تغییر کرد!"; else chk "anon PATCH روی ads (باید ۰ ردیف/رد)" "$c" "200|401|403|404"; fi

c=$(code -X DELETE "$SB/rest/v1/ads?id=eq.$FAKE" "${H[@]}" -H "Prefer: return=representation")
if [ "$c" = "200" ] && [ "$(cat /tmp/sec_body)" != "[]" ]; then echo "FAIL  anon DELETE روی ads"; else chk "anon DELETE روی ads" "$c" "200|204|401|403|404"; fi

for t in admins messages reviews reports banned_terms push_subscriptions; do
  c=$(code -X POST "$SB/rest/v1/$t" "${H[@]}" -d '{"id":"sec-test"}')
  chk "anon INSERT روی $t" "$c" "401|403|400|404|409"
done
c=$(code -X POST "$SB/rest/v1/admins" "${H[@]}" -d "{\"user_id\":\"$FAKE\"}")
chk "anon INSERT روی admins (ارتقا به ادمین)" "$c" "401|403|400|404|409"

echo; echo "== ۲) توابع RPC"
c=$(code -X POST "$SB/rest/v1/rpc/admin_set_status" "${H[@]}" -d '{"p_id":"x","p_status":"approved"}')
chk "anon → admin_set_status" "$c" "401|403|404|400"
c=$(code -X POST "$SB/rest/v1/rpc/admin_delete_ad" "${H[@]}" -d '{"p_id":"x"}')
chk "anon → admin_delete_ad" "$c" "401|403|404|400"
c=$(code -X POST "$SB/rest/v1/rpc/bump_stat" "${H[@]}" -d '{"p_ad":"x","p_field":"views"}')
chk "anon → bump_stat مستقیم (باید بسته باشد)" "$c" "401|403|404"
for i in 1 2 3; do c=$(code -X POST "$SB/rest/v1/rpc/bump_stat_safe" "${H[@]}" -d '{"p_ad":"sec-test-ad","p_field":"views"}'); echo "     bump_stat_safe #$i → HTTP $c"; done
echo "     (۳ بار برای یک آگهی از یک IP: فقط بار اول باید در دیتابیس حساب شود؛ بررسی:  select count(*) from stat_events where ad_id='sec-test-ad';  باید ۱ باشد)"

echo; echo "== ۳) Storage"
c=$(code -X POST "$SB/storage/v1/object/ad-images/sec-test/x.txt" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: text/plain" --data-binary "pwn")
chk "anon آپلود در ad-images" "$c" "400|401|403|404"
c=$(code -X POST "$SB/storage/v1/object/list/ad-images" "${H[@]}" -d '{"prefix":"","limit":5}')
echo "     لیست باکت برای anon → HTTP $c  $(head -c 120 /tmp/sec_body)   (اگر فهرست فایل‌ها برگشت، لیست‌شدن باید بسته شود)"
c=$(code -X POST "$SB/storage/v1/object/ad-images/sec-test/x.svg" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: image/svg+xml" --data-binary '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>')
chk "anon آپلود SVG" "$c" "400|401|403|404"

echo; echo "== ۴) خواندن بدون ورود"
c=$(code "$SB/rest/v1/ads?status=neq.approved&select=id,status&limit=5" "${H[@]}")
echo "     آگهی غیر approved برای anon → HTTP $c  $(head -c 100 /tmp/sec_body)  (باید [] باشد)"
c=$(code "$SB/rest/v1/messages?select=*&limit=1" "${H[@]}"); echo "     messages → $(head -c 80 /tmp/sec_body)  (باید [] یا خطا)"
c=$(code "$SB/rest/v1/banned_terms?select=*&limit=1" "${H[@]}"); echo "     banned_terms → $(head -c 80 /tmp/sec_body)  (باید [] یا خطا)"
echo; echo "پایان. هر خطی که FAIL دارد را برای من بفرستید."
