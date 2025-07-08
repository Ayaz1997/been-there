export type Image = {
  id: number;
  src: string;
  caption: string;
  description: string;
  dataAiHint: string;
  rotation: number;
  loading?: boolean;
};

export type Trip = {
  id: number;
  name: string;
  images: Image[];
};
