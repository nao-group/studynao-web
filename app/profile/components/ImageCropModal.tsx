"use client";

import { useCallback, useState } from "react";
import { Group, Modal, Slider, Stack, Text } from "@mantine/core";
import Cropper, { type Area } from "react-easy-crop";
import { LandingActionButton } from "@/components/ui/landing-action-button";
import { notifyError } from "@/lib/feedback";

async function cropImage(source: string, area: Area): Promise<Blob> {
  const image = new Image();
  image.src = source;
  await image.decode();
  const canvas = document.createElement("canvas");
  const size = Math.min(1024, area.width, area.height);
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image cropping is unavailable in this browser.");
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Unable to save cropped image.")), "image/jpeg", .92));
}

export function ImageCropModal({ source, opened, saving, onClose, onSave }: { source: string; opened: boolean; saving: boolean; onClose: () => void; onSave: (blob: Blob) => void }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const onCropComplete = useCallback((_cropped: Area, pixels: Area) => setArea(pixels), []);
  async function save() {
    if (!area) return;
    try { onSave(await cropImage(source, area)); }
    catch (error) { notifyError(error instanceof Error ? error.message : "Unable to crop picture."); }
  }
  return <Modal opened={opened} onClose={onClose} title="Adjust profile picture" centered size="md" radius="lg" overlayProps={{ backgroundOpacity: .55, blur: 3 }}>
    <Stack gap="lg"><Text size="sm" c="dimmed">Drag to position your picture, then adjust the zoom.</Text>
      <div style={{ position: "relative", width: "100%", height: 320, borderRadius: 16, overflow: "hidden", background: "#0d2a35" }}><Cropper image={source} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} /></div>
      <Slider aria-label="Profile picture zoom" value={zoom} onChange={setZoom} min={1} max={3} step={.01} color="yellow" />
      <Group justify="flex-end"><LandingActionButton tone="secondary" onClick={onClose} disabled={saving}>Cancel</LandingActionButton><LandingActionButton onClick={() => void save()} loading={saving}>Save picture</LandingActionButton></Group>
    </Stack>
  </Modal>;
}
