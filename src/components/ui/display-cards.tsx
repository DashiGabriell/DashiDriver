import { cn } from "@/lib/utils";

interface DisplayCardProps {
  className?: string;
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  description?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  imageSrc,
  imageAlt = "",
  title = "Featured",
  description = "Discover amazing content",
  titleClassName = "text-accent",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 bg-muted/70 backdrop-blur-sm px-4 py-3 transition-all duration-700 after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-[''] hover:border-accent/40 hover:bg-muted [&>*]:flex [&>*]:items-center [&>*]:gap-2 overflow-hidden",
        className
      )}
    >
      <div>
        {imageSrc && (
          <span className="relative inline-block">
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-7 h-7 object-contain"
            />
          </span>
        )}
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="text-sm leading-tight line-clamp-2">{description}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      imageSrc: "",
      imageAlt: "placeholder",
      title: "Featured",
      description: "Discover amazing content",
      className:
        "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      imageSrc: "",
      imageAlt: "placeholder",
      title: "Popular",
      description: "Trending this week",
      className:
        "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0",
    },
    {
      imageSrc: "",
      imageAlt: "placeholder",
      title: "New",
      description: "Latest updates and features",
      className:
        "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
    },
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}
