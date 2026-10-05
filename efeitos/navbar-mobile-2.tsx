import React, { useRef, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Calendar, Shield, Settings } from 'lucide-react';

type IconComponentType = React.ReactNode;
export interface InteractiveMenuItem {
  label: string;
  icon: IconComponentType;
  to: string;
}

export interface InteractiveMenuProps {
  items?: { label: string; icon: React.ReactNode; to: string }[];
  accentColor?: string;
}

const defaultItems: InteractiveMenuItem[] = [
    { label: 'home', icon: <Home size={20} />, to: '/' },
    { label: 'strategy', icon: <Briefcase size={20} />, to: '/strategy' },
    { label: 'period', icon: <Calendar size={20} />, to: '/period' },
    { label: 'security', icon: <Shield size={20} />, to: '/security' },
    { label: 'settings', icon: <Settings size={20} />, to: '/settings' },
];

const defaultAccentColor = 'var(--component-active-color-default)';

const InteractiveMenu: React.FC<InteractiveMenuProps> = ({ items, accentColor }) => {
  const location = useLocation();

  const finalItems = useMemo(() => {
     const isValid = items && Array.isArray(items) && items.length >= 2 && items.length <= 5;
     if (!isValid) {
        console.warn("InteractiveMenu: 'items' prop is invalid or missing. Using default items.", items);
        return defaultItems;
     }
     return items;
  }, [items]);

  const activeIndex = useMemo(() => {
    return finalItems.findIndex(item => item.to === location.pathname);
  }, [finalItems, location.pathname]);

  const textRefs = useRef<(HTMLElement | null)[]>([]);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndex, finalItems]);

  const navStyle = useMemo(() => {
      const activeColor = accentColor || defaultAccentColor;
      return { '--component-active-color': activeColor } as React.CSSProperties;
  }, [accentColor]); 

  return (
    <nav
      className="menu"
      role="navigation"
      style={navStyle}
    >
      {finalItems.map((item, index) => {
        const isActive = index === activeIndex;
        const isTextActive = isActive;

        return (
          <Link
            key={item.label}
            to={item.to}
            className={`menu__item ${isActive ? 'active' : ''}`}
            ref={(el) => (itemRefs.current[index] = el as unknown as HTMLButtonElement)}
            style={{ '--lineWidth': '0px' } as React.CSSProperties} 
          >
            <div className="menu__icon">
              {item.icon}
            </div>
            <strong
              className={`menu__text ${isTextActive ? 'active' : ''}`}
              ref={(el) => (textRefs.current[index] = el)}
            >
              {item.label}
            </strong>
          </Link>
        );
      })}
    </nav>
  );
};

export {InteractiveMenu}