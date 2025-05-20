from django import forms
from .models import Photo

class PhotoForm(forms.ModelForm):
    """
    画像アップロード用のフォーム
    """
    class Meta:
        model = Photo
        fields = ('image',)
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].widget.attrs.update({
            'class': 'form-control',
            'id': 'formFile',
        })