export type Image = {
  id: number;
  src: string;
  caption: string;
  rotation: number;
  dataAiHint?: string;
};

export type Trip = {
  id: number;
  name: string;
  description: string;
  date: string;
  bestMoment: string;
  worstMoment: string;
  images: Image[];
};
