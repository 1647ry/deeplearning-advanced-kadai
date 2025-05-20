// DOM要素の読み込み完了後に実行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded');  // デバッグ用メッセージ
    
    // 要素の取得
    const fileInput = document.getElementById('formFile');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const predictButton = document.getElementById('predict-button');
    const uploadForm = document.getElementById('upload-form');
    const resultContainer = document.getElementById('result-container');
    const resultImage = document.getElementById('result-image');
    const predictionResults = document.getElementById('prediction-results');
    
    console.log('FileInput element:', fileInput);  // デバッグ用メッセージ
    
    if (fileInput) {
        // ファイル選択時のイベント
        fileInput.addEventListener('change', function() {
            console.log('File selected');  // デバッグ用メッセージ
            
            // 前回の判定結果をクリア
            if (resultContainer) {
                resultContainer.style.display = 'none';
            }
            
            if (fileInput.files && fileInput.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // プレビュー画像を表示
                    imagePreview.src = e.target.result;
                    previewContainer.style.display = 'block';
                    
                    // 判定ボタンを有効化
                    predictButton.disabled = false;
                    console.log('Button enabled');  // デバッグ用メッセージ
                }
                
                reader.readAsDataURL(fileInput.files[0]);
            } else {
                // ファイルが選択されていない場合
                previewContainer.style.display = 'none';
                predictButton.disabled = true;
            }
        });
    } else {
        console.error('File input element not found!');
    }
    
    if (predictButton) {
        // 判定ボタンのクリックイベント
        predictButton.addEventListener('click', function() {
            console.log('Predict button clicked');  // デバッグ用メッセージ
            
            // フォームデータの作成
            const formData = new FormData(uploadForm);
            
            // ローディング表示
            predictButton.disabled = true;
            predictButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> 判定中...';
            
            // CSRFトークンを取得
            const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value;
            
            // Ajax リクエスト
            fetch('/predict/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRFToken': csrftoken
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log('Response received:', data);  // デバッグ用メッセージ
                
                if (data.success) {
                    // プレビュー画像を非表示
                    previewContainer.style.display = 'none';
                    
                    // 結果画像を表示
                    resultImage.src = data.image_url;
                    
                    // 判定結果テーブルの作成
                    predictionResults.innerHTML = '';
                    data.predictions.forEach(prediction => {
                        const row = document.createElement('tr');
                        
                        const nameCell = document.createElement('td');
                        nameCell.textContent = prediction.name;
                        
                        const probCell = document.createElement('td');
                        const probText = document.createElement('div');
                        probText.textContent = prediction.probability.toFixed(2) + '%';
                        
                        const progressContainer = document.createElement('div');
                        progressContainer.className = 'progress mt-1';
                        
                        const progressBar = document.createElement('div');
                        progressBar.className = 'progress-bar';
                        progressBar.style.width = prediction.probability + '%';
                        progressBar.setAttribute('role', 'progressbar');
                        progressBar.setAttribute('aria-valuenow', prediction.probability);
                        progressBar.setAttribute('aria-valuemin', '0');
                        progressBar.setAttribute('aria-valuemax', '100');
                        
                        progressContainer.appendChild(progressBar);
                        probCell.appendChild(probText);
                        probCell.appendChild(progressContainer);
                        
                        row.appendChild(nameCell);
                        row.appendChild(probCell);
                        
                        predictionResults.appendChild(row);
                    });
                    
                    // 結果コンテナを表示
                    resultContainer.style.display = 'block';
                } else {
                    alert('エラーが発生しました。再度お試しください。');
                    console.error('Error data:', data);  // デバッグ用メッセージ
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('エラーが発生しました。再度お試しください。');
            })
            .finally(() => {
                // ボタンの状態を戻す
                predictButton.disabled = false;
                predictButton.innerHTML = '判定';
            });
        });
    } else {
        console.error('Predict button element not found!');
    }
});