import cv2
import json
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import winsound

SAVE_FILE = "visited_shops.json"
FRONTEND_DATA_FILE = "user_status.json"

SHOP_NAMES = {
    "001": "魚菜屋 魚がし食堂 中央市場店", "002": "のどぐろ丼専門店 あえのこと",
    "003": "廻る寿し ぽん太", "004": "かいてん寿し 大倉",
    "005": "高崎屋寿し", "006": "麺屋 大河",
    "007": "麺屋吉宗", "008": "らーめん 一心屋",
    "009": "赤玉 本店", "010": "スペイン料理 アロス",
    "011": "ヤマト醤油味噌 糀", "012": "石丸食品",
    "013": "味の十字屋", "014": "佃の佃煮",
    "015": "芝寿し 保古店", "016": "金沢浅田屋 金沢百番街店",
    "017": "手押し棒鮨 舟楽 近江町本店", "018": "油与商店",
    "019": "味百珍かさい", "020": "近江町コロッケ"
}

def load_visited():
    if os.path.exists(SAVE_FILE):
        with open(SAVE_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()

def save_visited(visited_set):
    with open(SAVE_FILE, "w", encoding="utf-8") as f:
        json.dump(list(visited_set), f, ensure_ascii=False, indent=4)

def update_frontend_data(visited_set):
    visited_list = list(visited_set)
    visited_count = len(visited_list)
    
    coupons_earned = visited_count // 5
    next_coupon_target = (coupons_earned + 1) * 5
    shops_until_next = next_coupon_target - visited_count
    if visited_count >= 20: 
        shops_until_next = 0

    status_data = {
        "visited_count": visited_count,
        "visited_shops": visited_list,
        "coupons_earned": coupons_earned,
        "shops_until_next_coupon": shops_until_next,
        "is_complete": visited_count == 20
    }

    with open(FRONTEND_DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(status_data, f, ensure_ascii=False, indent=4)


def put_japanese_text(img, text, position, font_size, color):
    rgb_color = (color[2], color[1], color[0])
    pil_img = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    draw = ImageDraw.Draw(pil_img)
    try:
        font = ImageFont.truetype("meiryo.ttc", font_size)
    except IOError:
        try:
            font = ImageFont.truetype("msgothic.ttc", font_size)
        except IOError:
            font = ImageFont.load_default()
    draw.text(position, text, font=font, fill=rgb_color)
    return cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

def main():
    visited_shops = load_visited()
    update_frontend_data(visited_shops)
    
    # ターミナル（黒い画面）側には操作方法を残しておきます
    print(f"起動完了！現在 {len(visited_shops)} 店舗訪問済みです。")
    print("【操作方法】 [スペース]:スキャン / [q]:終了 / [r]:リセット")

    cap = cv2.VideoCapture(0)
    detector = cv2.QRCodeDetector()

    scan_message_jp = ""
    scan_message_color = (0, 255, 0)
    scan_message_timer = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # 中央のターゲット枠（水色の四角形）だけを描画する
        h, w, _ = frame.shape
        box_size = 250
        pt1 = (w // 2 - box_size // 2, h // 2 - box_size // 2)
        pt2 = (w // 2 + box_size // 2, h // 2 + box_size // 2)
        cv2.rectangle(frame, pt1, pt2, (255, 255, 0), 2) 
        
        # ▼ここにあった「Align QR Code Here」や「Visited:」などの文字描画処理を全て削除しました▼

        # シャッターを押した後の結果メッセージだけは一時的に表示する
        if scan_message_timer > 0:
            frame = put_japanese_text(frame, scan_message_jp, (10, 140), 30, scan_message_color)
            scan_message_timer -= 1

        cv2.imshow("Gyotuu QR Scanner", frame)

        key = cv2.waitKey(1) & 0xFF
        
        if key == ord('q'):
            break
        elif key == ord('r'):
            visited_shops.clear()
            save_visited(visited_shops)
            update_frontend_data(visited_shops)
            print("\n🔄 訪問履歴をリセットしました！\n")
            scan_message_jp = "履歴をリセット"
            scan_message_color = (255, 255, 255)
            scan_message_timer = 60
            winsound.Beep(1000, 100)
            
        elif key == 32:  
            winsound.Beep(800, 100) 
            
            try:
                qr_data, bbox, _ = detector.detectAndDecode(frame)

                if bbox is not None and qr_data:
                    try:
                        data = json.loads(qr_data)
                        if data.get("app") == "gyotuu":
                            shop_id = data.get("shop_id")
                            shop_name = SHOP_NAMES.get(shop_id, "不明な店舗")
                            
                            if shop_id not in visited_shops:
                                visited_shops.add(shop_id)
                                save_visited(visited_shops)
                                update_frontend_data(visited_shops)
                                
                                current_count = len(visited_shops)
                                print(f"✨ 新規チェックイン！ {shop_name} (ID: {shop_id})")
                                
                                if current_count % 5 == 0:
                                    print(f"🎉 祝！ {current_count}店舗達成！ クーポンを獲得しました！")
                                    scan_message_jp = "【成功】クーポンGET!"
                                    scan_message_color = (0, 255, 255)
                                    winsound.Beep(1046, 150)
                                    winsound.Beep(1318, 150)
                                    winsound.Beep(1568, 150)
                                    winsound.Beep(2093, 400)
                                else:
                                    scan_message_jp = f"【成功】{shop_name}"
                                    scan_message_color = (0, 255, 0)
                                    winsound.Beep(1200, 100)
                                    winsound.Beep(1800, 150)
                            else:
                                print(f"✅ {shop_name} は既に訪問済みです。")
                                scan_message_jp = f"【訪問済】{shop_name}"
                                scan_message_color = (255, 200, 0)
                                winsound.Beep(1000, 100)
                                winsound.Beep(1000, 150)
                            
                            frame = put_japanese_text(frame, scan_message_jp, (10, 140), 30, scan_message_color)
                            cv2.imshow("Gyotuu QR Scanner", frame)
                            cv2.waitKey(2000) 
                            break 

                        else:
                            scan_message_jp = "無効なQRコード"
                            scan_message_color = (0, 0, 255)
                            scan_message_timer = 90
                            winsound.Beep(300, 300) 
                    except json.JSONDecodeError:
                        scan_message_jp = "データエラー"
                        scan_message_color = (0, 0, 255)
                        scan_message_timer = 90
                        winsound.Beep(300, 300) 
                else:
                    scan_message_jp = "QRが見つかりません"
                    scan_message_color = (0, 165, 255)
                    scan_message_timer = 90
                    winsound.Beep(300, 300)
            except cv2.error:
                scan_message_jp = "読み取りエラー"
                scan_message_color = (0, 0, 255)
                scan_message_timer = 60
                winsound.Beep(300, 300)

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()