from PIL import Image
from app.model import get_model

def preprocess_image(img_path):
    _, preprocess, _ = get_model()
    img = Image.open(img_path).convert("RGB")
    return preprocess(img).unsqueeze(0)
