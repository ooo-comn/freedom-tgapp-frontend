export interface IFeedbackItem {
  user: {
    first_name: string;
    last_name: string;
    university: string;
    image_url: string;
  };
  rate: number;
  review: string;
}
