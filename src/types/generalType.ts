import { RowDataPacket } from "mysql2";

type imageSlider = {
  images: string[];
  styles: {};
  paginationType: string;
};

type productPreview = {
  name: string;
  id: string;
  price: number;
  image: string;
  styles: {};
};

type productCards = {
  products: productPreview[];
  styles: {};
};

type category = {
  name: string;
  id: string;
};

type categories = {
  category: category[];
  styles: {};
};

type searchBar = {
  styles: {};
  placeholder: {};
};

type banner = {
  styles: {};
  image: string;
  navigation: string;
  title: string;
  subtitle: string;
  buttonText: string;
};

export type baseModule = {
  name: string;
  type: "imageSlider" | "productCards" | "categories" | "searchBar" | "banner";
  module: imageSlider | productCards | categories | searchBar | banner;
  styles: {};
  moduleProps: {};
  moduleState: boolean;
};

export type product = {
  name: string;
  id: string;
  price: number;
  image: string;
  styles: { [key: string]: {} };
};

export interface productImageSlider extends product, RowDataPacket {
  images: string[];
  paginationType: string;
  styles: {
    sliderStyles: {};
    imageStyles: {};
  };
}

export type ProductInfoModuleBase = {
  name: string;
  price: number;
  favoriteRate: number;
  likeRate: number;
  reviewCount: number;
  styles: {};
  isOnSale: boolean;
  priceBefore: number;
  saleBadgeText: string;
  saleBadgeIcon: string;
  productColors: string[];
  descriptionTitle: string;
  description: string;
  specificationsTitle: string;
  specifications: Specification[];
};

export type Specification = {
  title: string;
  value: string;
};

type ProductInfoModule = ProductInfoModuleBase &
  (ProductInfoModuleBase["isOnSale"] extends true
    ? { priceBefore: number }
    : { priceBefore?: undefined });

export type productModules = {
  productDetail: product;
  modules: (ProductInfoModule | productImageSlider)[];
};
