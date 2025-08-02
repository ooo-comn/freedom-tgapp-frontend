export interface IFeedback {
  user: ITelegramUser;
  author: number;
  course: number;
  date: string;
  rate: number;
  review: string | null;
}

export interface ITopic {
  topic: string;
  desc: string;
}

export interface IReview {
  id: string;
  created_at: string;
  updated_at: string;
  author_id: number;
  contact_id: number;
  rating: number;
  comment: string;
}

export interface ITelegramUser {
  id: number;
  telegram_id: number;
  username: string;
  first_name: string;
  last_name: string;
  university: string;
  description: string;
  notify: boolean;
  image_url: string;
  registrated: boolean;
  verified: string;
  balance: number;
  is_staff: boolean;
  is_active: boolean;
  created_at: string;
}

export interface IContact {
  id: number | null;
  user_id: number;
  subjects: string[];
  work_types: string[];
  customer_count: number;
  image_url: string;
  is_visible?: boolean;
}

export interface IChannel {
  user: number;
  chat_id: string | null;
  date: string | null;
  name: string | null;
  photo: string | null;
  url: string | null;
  connected: boolean;
  connected_course: number | null;
}

// export interface ITransaction {
// 	id: number
// 	course: ICourse
// 	buyer: number
// 	seller: number
// 	date: string
// 	price: number
// 	method: string | null
// 	send: boolean
// 	state: string | null
// 	return_status: number
// 	buyer_address: string | null
// 	seller_address: string | null
// }

// export interface IPassportData {
// 	user: number
// 	passport_scan: string
// 	registration_scan: string
// 	name: string
// 	surname: string
// 	second_name: string
// 	birth_place: string
// 	birth_date: string
// 	passport_date: string
// 	id_num: string
// 	code: string
// 	provided: string
// 	registration_address: string
// 	inn: string
// 	phone: string
// 	email: string
// 	approved: boolean
// }
