import os
import numpy as np
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import JsonResponse
from .forms import PhotoForm
from .models import Photo
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import preprocess_input, decode_predictions

# VGG16モデルの読み込み
# モデルが存在するか確認してからロード
MODEL_PATH = os.path.join(settings.BASE_DIR, 'vgg16.h5')
try:
    # モデルの存在確認
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
    else:
        # モデルが存在しない場合はVGG16をインポート
        from tensorflow.keras.applications import VGG16
        model = VGG16(weights='imagenet')
        # 必要に応じてモデルを保存
        model.save(MODEL_PATH)
except Exception as e:
    print(f"モデルの読み込みエラー: {e}")
    # エラー時にフォールバック
    from tensorflow.keras.applications import VGG16
    model = VGG16(weights='imagenet')

def index(request):
    """
    トップページのビュー
    """
    form = PhotoForm()
    return render(request, 'prediction/index.html', {'form': form})

def predict(request):
    """
    画像判定処理のビュー
    """
    if request.method == 'POST':
        form = PhotoForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                # 画像を保存
                photo = form.save()
                
                # 画像のパスを取得
                img_path = photo.image.path
                
                # 画像を読み込んで前処理
                img = image.load_img(img_path, target_size=(224, 224))
                x = image.img_to_array(img)
                x = np.expand_dims(x, axis=0)
                x = preprocess_input(x)
                
                # 予測を実行
                preds = model.predict(x)
                
                # 予測結果を整形（上位5件）
                results = decode_predictions(preds, top=5)[0]
                predictions = [
                    {
                        'label': label,
                        'name': name,
                        'probability': float(prob) * 100  # パーセンテージに変換
                    }
                    for (label, name, prob) in results
                ]
                
                # 画像のURLを取得
                img_url = photo.image.url
                
                # 結果をJSONで返す
                return JsonResponse({
                    'success': True,
                    'predictions': predictions,
                    'image_url': img_url
                })
            except Exception as e:
                print(f"予測処理エラー: {e}")
                return JsonResponse({
                    'success': False, 
                    'errors': str(e)
                })
        else:
            return JsonResponse({'success': False, 'errors': form.errors})
    
    return redirect('prediction:index')