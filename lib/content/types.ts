export type SectionKind =
  | "text"
  | "textarea"
  | "image"
  | "gallery"
  | "link"
  | "contact_group"
  | "class_card_group"
  | "json";

export type SectionValue = {
  key: string;
  label: string;
  kind: SectionKind;
  textValue: string | null;
  imagePath: string | null;
  altText: string | null;
  isActive: boolean;
  sortOrder: number;
  jsonValue: unknown;
};

export type HomePageContent = {
  pageTitle: string;
  seoTitle: string | null;
  seoDescription: string | null;
  sections: Record<string, SectionValue>;
  settings: {
    siteName: string | null;
    primaryPhone: string | null;
    primaryEmail: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    postcode: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    linkedinUrl: string | null;
    bookingUrl: string | null;
  };
};
