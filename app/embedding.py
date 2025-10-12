# app/embedding.py
try:
    from .embeddings_resnet import get_resnet_embedding as get_image_embedding
    EMBEDDING_DIM = 2048
except Exception:
    def get_image_embedding(_path: str):
        raise RuntimeError("Embedding backend not initialized")
    EMBEDDING_DIM = 2048

