export interface ProductDTO {
  id_product: number;
  id_client: number;
  name: string;
  description: string | null;
  vc_image: string | null;
  i_status: number;
  dt_created: string;
  dt_updated: string;
}