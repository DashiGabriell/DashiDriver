import type { Car } from "./KeyTag";

const yard = (oficina: string) => ({
  alugado: "",
  atrasado: "",
  disponivel: "Pronto para sair",
  oficina,
});

export const EXAMPLE_FLEET: Car[] = [
  { plate: "QTP4E21", model: "Onix 1.0 · 2022", driver: "Jefferson S.", weekly: 650, status: "alugado", note: yard("Troca de óleo") },
  { plate: "RKD7B03", model: "HB20 · 2021", driver: "Thaís R.", weekly: 620, status: "alugado", note: yard("Pastilhas de freio") },
  { plate: "SFA1C88", model: "Mobi · 2023", driver: "Marcos A.", weekly: 550, status: "atrasado", note: yard("Alinhamento") },
  { plate: "PNX9J45", model: "Argo · 2022", driver: "Wellington P.", weekly: 680, status: "alugado", note: yard("Revisão 40 mil") },
  { plate: "RJX2H10", model: "Kwid · 2021", driver: "Diego F.", weekly: 520, status: "disponivel", note: yard("Bateria") },
  { plate: "QOA5D72", model: "Cronos · 2023", driver: "Ana Paula M.", weekly: 720, status: "alugado", note: yard("Funilaria") },
  { plate: "SGB3F09", model: "Spin · 2022", driver: "Cleber J.", weekly: 750, status: "oficina", note: yard("Embreagem") },
  { plate: "RTM8A64", model: "Virtus · 2023", driver: "Rafael O.", weekly: 740, status: "alugado", note: yard("Troca de óleo") },
  { plate: "PUC6G31", model: "Logan · 2020", driver: "Edson L.", weekly: 580, status: "alugado", note: yard("Suspensão") },
  { plate: "QYR0K57", model: "Polo · 2022", driver: "Priscila N.", weekly: 700, status: "atrasado", note: yard("Pneus") },
  { plate: "SDE4B26", model: "Onix Plus · 2023", driver: "Lucas V.", weekly: 690, status: "alugado", note: yard("Ar-condicionado") },
  { plate: "RLW1M93", model: "HB20S · 2021", driver: "Roberta C.", weekly: 640, status: "disponivel", note: yard("Revisão 20 mil") },
  { plate: "PTA7C40", model: "Mobi · 2022", driver: "Gilson T.", weekly: 540, status: "alugado", note: yard("Troca de óleo") },
  { plate: "QKE2D18", model: "Argo · 2021", driver: "Sabrina F.", weekly: 660, status: "oficina", note: yard("Câmbio") },
  { plate: "SHN5E77", model: "Kwid · 2023", driver: "Paulo H.", weekly: 530, status: "alugado", note: yard("Bateria") },
  { plate: "RBV9F62", model: "Cronos · 2022", driver: "Vanessa D.", weekly: 710, status: "alugado", note: yard("Freios") },
];
