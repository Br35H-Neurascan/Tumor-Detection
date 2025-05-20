import os
import torch
import torchvision
from torchvision.models.detection import maskrcnn_resnet50_fpn
from torchvision.transforms import functional as F
from torch.utils.data import DataLoader
from pycocotools.coco import COCO
from pycocotools import mask as maskUtils
import numpy as np
from PIL import Image
from tqdm import tqdm
import json
from sklearn.metrics import precision_score, recall_score, f1_score, accuracy_score

class CocoDataset(torch.utils.data.Dataset):
    def __init__(self, images_dir, ann_file, transforms=None):
        self.images_dir = images_dir
        self.coco = COCO(ann_file)
        self.img_ids = list(self.coco.imgs.keys())
        self.transforms = transforms

    def __getitem__(self, idx):
        img_id = self.img_ids[idx]
        ann_ids = self.coco.getAnnIds(imgIds=img_id)
        anns = self.coco.loadAnns(ann_ids)
        img_info = self.coco.loadImgs(img_id)[0]
        img_path = os.path.join(self.images_dir, img_info['file_name'])
        img = Image.open(img_path).convert('RGB')
        masks = []
        boxes = []
        labels = []
        for ann in anns:
            if 'segmentation' in ann:
                rle = maskUtils.frPyObjects(ann['segmentation'], img_info['height'], img_info['width'])
                mask = maskUtils.decode(rle)
                if len(mask.shape) == 3:
                    mask = np.any(mask, axis=2)
                if mask.sum() == 0:
                    continue  # skip empty masks
                # Calculate bbox from mask
                pos = np.where(mask)
                if pos[0].size == 0 or pos[1].size == 0:
                    continue  # skip if mask is empty
                x_min = np.min(pos[1])
                y_min = np.min(pos[0])
                x_max = np.max(pos[1])
                y_max = np.max(pos[0])
                # Clip to image size
                x_min = max(0, min(x_min, img_info['width'] - 1))
                y_min = max(0, min(y_min, img_info['height'] - 1))
                x_max = max(0, min(x_max, img_info['width'] - 1))
                y_max = max(0, min(y_max, img_info['height'] - 1))
                width_box = x_max - x_min
                height_box = y_max - y_min
                # Final check: box must be within image and have positive size
                if (
                    x_max > x_min and y_max > y_min and
                    x_min >= 0 and y_min >= 0 and
                    x_max <= img_info['width'] and
                    y_max <= img_info['height']
                ):
                    masks.append(mask.astype(np.uint8))
                    boxes.append([x_min, y_min, x_max, y_max])
                    labels.append(ann['category_id'])
                else:
                    print(f"Skipping invalid box {[x_min, y_min, x_max, y_max]} in {img_info['file_name']}")
        if len(boxes) == 0:
            # Return None if no valid boxes
            return None
        masks = np.stack(masks, axis=0)
        boxes = torch.as_tensor(boxes, dtype=torch.float32)
        labels = torch.as_tensor(labels, dtype=torch.int64)
        masks = torch.as_tensor(masks, dtype=torch.uint8)
        image_id = torch.tensor([img_id])
        area = (boxes[:, 2] * boxes[:, 3]) if len(boxes) > 0 else torch.tensor([])
        iscrowd = torch.zeros((len(boxes),), dtype=torch.int64)
        target = {
            'boxes': boxes,
            'labels': labels,
            'masks': masks,
            'image_id': image_id,
            'area': area,
            'iscrowd': iscrowd
        }
        if self.transforms:
            img = self.transforms(img)
        else:
            img = F.to_tensor(img)
        return img, target

    def __len__(self):
        return len(self.img_ids)

def get_transform():
    return F.to_tensor

def collate_fn(batch):
    # Remove any None items
    batch = [b for b in batch if b is not None]
    if len(batch) == 0:
        return None, None
    return tuple(zip(*batch))

def train_one_epoch(model, optimizer, data_loader, device, epoch, print_freq=50):
    model.train()
    running_loss = 0.0
    for i, (images, targets) in enumerate(tqdm(data_loader)):
        if images is None or targets is None:
            continue
        images = list(img.to(device) for img in images)
        targets = [{k: v.to(device) for k, v in t.items()} for t in targets]
        loss_dict = model(images, targets)
        losses = sum(loss for loss in loss_dict.values())
        optimizer.zero_grad()
        losses.backward()
        optimizer.step()
        running_loss += losses.item()
        if (i + 1) % print_freq == 0:
            print(f"Epoch {epoch}, Iteration {i+1}, Loss: {losses.item():.4f}")
    return running_loss / len(data_loader)

def evaluate(model, data_loader, device):
    model.eval()
    all_preds = []
    all_gts = []
    with torch.no_grad():
        for images, targets in tqdm(data_loader):
            if images is None or targets is None:
                continue  # Skip empty batches
            images = list(img.to(device) for img in images)
            outputs = model(images)
            for output, target in zip(outputs, targets):
                # For each image, check if any tumor is detected (label==1)
                pred_label = 1 if (output['scores'].cpu() > 0.5).any() else 0
                gt_label = 1 if (target['labels'] == 1).any() else 0
                all_preds.append(pred_label)
                all_gts.append(gt_label)
    accuracy = accuracy_score(all_gts, all_preds)
    precision = precision_score(all_gts, all_preds, zero_division=0)
    recall = recall_score(all_gts, all_preds, zero_division=0)
    f1 = f1_score(all_gts, all_preds, zero_division=0)
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1-score: {f1:.4f}")
    return accuracy, precision, recall, f1

def main():
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    # Paths
    train_dir = 'TRAIN'
    val_dir = 'VAL'
    test_dir = 'TEST'
    train_ann = os.path.join(train_dir, 'annotations_train_coco.json')
    val_ann = os.path.join(val_dir, 'annotations_VAL_coco.json')
    test_ann = os.path.join(test_dir, 'annotations_test_coco.json')
    # Datasets
    train_dataset = CocoDataset(train_dir, train_ann)
    val_dataset = CocoDataset(val_dir, val_ann)
    test_dataset = CocoDataset(test_dir, test_ann)
    # DataLoaders
    train_loader = DataLoader(train_dataset, batch_size=4, shuffle=True, num_workers=0, collate_fn=collate_fn)
    val_loader = DataLoader(val_dataset, batch_size=4, shuffle=False, num_workers=0, collate_fn=collate_fn)
    test_loader = DataLoader(test_dataset, batch_size=4, shuffle=False, num_workers=0, collate_fn=collate_fn)
    # Model
    model = maskrcnn_resnet50_fpn(num_classes=2)  # 1 class (tumor) + background
    model.to(device)
    # Optimizer
    params = [p for p in model.parameters() if p.requires_grad]
    optimizer = torch.optim.Adam(params, lr=0.0005)
    # Training loop
    best_f1 = 0.0
    for epoch in range(1, 11):
        print(f"Epoch {epoch}:")
        train_loss = train_one_epoch(model, optimizer, train_loader, device, epoch)
        print(f"Train Loss: {train_loss:.4f}")
        print("Validation metrics:")
        _, _, _, val_f1 = evaluate(model, val_loader, device)
        if val_f1 > best_f1:
            best_f1 = val_f1
            torch.save(model.state_dict(), 'mask_tumor.pth')
            print("Best model saved.")
    print("Testing best model on TEST set:")
    model.load_state_dict(torch.load('mask_tumor.pth'))
    evaluate(model, test_loader, device)

if __name__ == "__main__":
    main() 