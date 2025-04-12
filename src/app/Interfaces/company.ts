export interface Company {
  id: number;
  no_of_employee: number;
  title: string;
  logo: string | null; // Assuming logo can be a string or null
  status: number;
}
