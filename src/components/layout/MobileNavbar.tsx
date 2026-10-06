import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type PanInfo,
} from "framer-motion";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { src: "/assets/sidebar-dashboard.png", label: "Início", to: "/dashboard" },
  { src: "/assets/sidebar-carro.png", label: "Veículos", to: "/veiculos" },
  { src: "/assets/sidebar-motoristas.png", label: "Motoristas", to: "/motoristas" },
  { src: "/assets/checklist-sideabar.png", label: "Checklists", to: "/checklists" },
  { src: "/assets/sidebar-recebimentos.png", label: "Pagamentos", to: "/pagamentos" },
  { src: "/assets/sidebar-parcelaseguro.png", label: "Financiamento", to: "/financiamento-seguro" },
  { src: "/assets/sidebar-ferramentas.png", label: "Manutenção", to: "/manutencao" },
  { src: "/assets/sidebar-lucratividade.png", label: "Lucro", to: "/lucratividade" },
  { src: "/assets/sidebar-km.png", label: "KM", to: "/controle-km" },
  { src: "/assets/sidebar-alertas.png", label: "Alertas", to: "/alertas" },
  { src: "/assets/sidebar-users.png", label: "Usuários", to: "/usuarios" },
  { src: "/assets/sidebar-perfil.png", label: "Perfil", to: "/perfil" },
  { src: "/assets/suporte.png", label: "Suporte", to: "/suporte" },
] as const;

const VISIBLE = 5;
const CENTER_SLOT = Math.floor(VISIBLE / 2);
const MAX_START = NAV_ITEMS.length - VISIBLE;

const SPRING = { type: "spring", stiffness: 320, damping: 34, mass: 0.9 } as const;

const clampStart = (value: number) => Math.min(MAX_START, Math.max(0, value));

const findActiveIndex = (pathname: string) =>
  NAV_ITEMS.findIndex((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));

// Janela que deixa o item no centro quando possível; os 2 primeiros e os 2 últimos
// nunca chegam ao centro porque a lista não tem espaços vazios nas pontas.
const startFor = (index: number) => (index < 0 ? 0 : clampStart(index - CENTER_SLOT));

interface NavItemProps {
  index: number;
  item: (typeof NAV_ITEMS)[number];
  x: MotionValue<number>;
  itemWidth: number;
  isActive: boolean;
  isCentered: boolean;
  onFocusItem: (index: number) => void;
}

const NavItem = ({ index, item, x, itemWidth, isActive, isCentered, onFocusItem }: NavItemProps) => {
  // 1 quando o item está exatamente no centro da janela, 0 a partir de um item de distância.
  const centerness = useTransform(x, (latest) => {
    if (!itemWidth) return isCentered ? 1 : 0;
    const itemCenter = index * itemWidth + latest + itemWidth / 2;
    const viewportCenter = (CENTER_SLOT + 0.5) * itemWidth;
    return 1 - Math.min(1, Math.abs(itemCenter - viewportCenter) / itemWidth);
  });
  const circleScale = useTransform(centerness, [0, 1], [0.4, 1]);
  const circleOpacity = useTransform(centerness, [0.15, 0.85], [0, 1]);
  const iconFilter = useTransform(
    centerness,
    [0.35, 0.75],
    ["brightness(1) invert(0)", "brightness(0) invert(1)"],
  );
  const iconScale = useTransform(centerness, [0, 1], [1, 1.04]);

  return (
    <NavLink
      to={item.to}
      onFocus={() => onFocusItem(index)}
      aria-current={isActive ? "page" : undefined}
      className="relative flex h-full shrink-0 flex-col items-center justify-center gap-1 outline-none focus-visible:[&>span:first-child]:ring-2 focus-visible:[&>span:first-child]:ring-ring"
      style={{ width: itemWidth || `${100 / VISIBLE}%` }}
      draggable={false}
    >
      <span className="relative grid h-11 w-11 place-items-center rounded-full">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary shadow-[0_6px_16px_-4px_hsl(var(--primary)/0.55)]"
          style={{ scale: circleScale, opacity: circleOpacity }}
        />
        <motion.img
          src={item.src}
          alt=""
          draggable={false}
          className="relative h-[22px] w-[22px] object-contain select-none"
          style={{ filter: iconFilter, scale: iconScale }}
        />
      </span>
      <span
        className={cn(
          "max-w-full truncate px-0.5 text-[10px] leading-none transition-colors duration-300",
          isCentered || isActive ? "font-semibold text-primary" : "font-medium text-muted-foreground",
        )}
      >
        {item.label}
      </span>
      <span
        aria-hidden
        className={cn(
          "absolute bottom-1 h-1 w-1 rounded-full bg-primary transition-opacity duration-300",
          isActive && !isCentered ? "opacity-100" : "opacity-0",
        )}
      />
    </NavLink>
  );
};

export const MobileNavbar = () => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  const activeIndex = findActiveIndex(location.pathname);

  const viewportRef = useRef<HTMLDivElement>(null);
  const draggedRef = useRef(false);
  const [itemWidth, setItemWidth] = useState(0);
  const [start, setStart] = useState(() => startFor(activeIndex));
  const [centerIndex, setCenterIndex] = useState(() => startFor(activeIndex) + CENTER_SLOT);
  const x = useMotionValue(0);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => setItemWidth(el.clientWidth / VISIBLE);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const snapTo = useCallback(
    (nextStart: number) => {
      const target = clampStart(nextStart);
      setStart(target);
      setCenterIndex(target + CENTER_SLOT);
      if (!itemWidth) return;
      const to = -target * itemWidth;
      if (reduceMotion) {
        x.set(to);
      } else {
        animate(x, to, SPRING);
      }
    },
    [itemWidth, reduceMotion, x],
  );

  // Largura mudou (rotação, primeira medição): reposiciona sem animar.
  useLayoutEffect(() => {
    if (itemWidth) x.set(-start * itemWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemWidth]);

  useEffect(() => {
    snapTo(startFor(activeIndex));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(
    () =>
      x.on("change", (latest) => {
        if (!itemWidth) return;
        const next = clampStart(Math.round(-latest / itemWidth)) + CENTER_SLOT;
        setCenterIndex((prev) => (prev === next ? prev : next));
      }),
    [x, itemWidth],
  );

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (!itemWidth) return;
    const projected = x.get() + info.velocity.x * 0.18;
    snapTo(Math.round(-projected / itemWidth));
  };

  const canGoLeft = start > 0;
  const canGoRight = start < MAX_START;

  const arrowClass =
    "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted/70 text-foreground transition-[opacity,transform,background-color] duration-200 active:scale-90 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <div className="px-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
      <nav
        aria-label="Navegação principal"
        className="flex h-[68px] items-center gap-1 rounded-[26px] border border-border/70 bg-card px-1.5 shadow-[0_12px_32px_-10px_rgba(15,23,42,0.28),0_2px_6px_-2px_rgba(15,23,42,0.08)]"
      >
        <button
          type="button"
          onClick={() => snapTo(start - 1)}
          disabled={!canGoLeft}
          className={arrowClass}
          aria-label="Ver opções anteriores"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
        </button>

        <div ref={viewportRef} className="relative h-full min-w-0 flex-1 overflow-hidden">
          <motion.div
            className="flex h-full touch-pan-y"
            style={{ x }}
            drag={itemWidth ? "x" : false}
            dragConstraints={{ left: -MAX_START * itemWidth, right: 0 }}
            dragElastic={0.12}
            dragMomentum={false}
            onPointerDown={() => {
              draggedRef.current = false;
            }}
            onDragStart={() => {
              draggedRef.current = true;
            }}
            onDragEnd={handleDragEnd}
            onClickCapture={(e) => {
              if (draggedRef.current) {
                e.preventDefault();
                e.stopPropagation();
                draggedRef.current = false;
              }
            }}
          >
            {NAV_ITEMS.map((item, index) => (
              <NavItem
                key={item.to}
                index={index}
                item={item}
                x={x}
                itemWidth={itemWidth}
                isActive={index === activeIndex}
                isCentered={index === centerIndex}
                onFocusItem={(i) => {
                  if (i < start || i >= start + VISIBLE) snapTo(startFor(i));
                }}
              />
            ))}
          </motion.div>
        </div>

        <button
          type="button"
          onClick={() => snapTo(start + 1)}
          disabled={!canGoRight}
          className={arrowClass}
          aria-label="Ver próximas opções"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </nav>
    </div>
  );
};
