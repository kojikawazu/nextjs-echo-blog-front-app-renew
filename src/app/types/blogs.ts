export interface Blog {
    id: string;
    user_id: string;
    title: string;
    github_url?: string;
    category: string;
    tags: string[];
    description: string;
    likes: number;
    created_at: string;
    updated_at: string;
  }
  
  export interface Comment {
    id: string;
    blog_id: string;
    guest_user: string;
    comment: string;
    parent_id?: string;
    created_at: string;
  }
   
  export interface BlogLike {
    id: string;
    blog_id: string;
    visit_id: string;
    created_at: string;
    updated_at: string;
  }