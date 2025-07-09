export type Image = {
  id: number;
  src: string;
  caption: string;
  rotation: number;
};

export type Trip = {
  id: number;
  name: string;
  images: Image[];
};
