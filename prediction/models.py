from django.db import models

class Photo(models.Model):
    """
    アップロードされた画像を管理するモデル
    """
    image = models.ImageField(upload_to='photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo uploaded at {self.uploaded_at}"