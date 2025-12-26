// Atoms - Componentes base indivisibles
// Estos son componentes reutilizables de bajo nivel

// Exportar componentes personalizados de atoms
export { default as CurrencyDisplay } from './CurrencyDisplay';
export { default as StatusBadge } from './StatusBadge';
export { default as UserAvatar } from './UserAvatar';
export { default as IconButton } from './IconButton';
export { default as LoadingSpinner } from './LoadingSpinner';

// Re-exportar componentes de ui/ que funcionan como atoms
export {
  Button,
  Input,
  Badge,
  Avatar,
  Card,
  Dialog,
  DropdownMenu,
  Form,
  Label,
  Select,
  Switch,
  Textarea,
  Checkbox,
  RadioGroup,
  Progress,
  Separator,
  Skeleton,
  Tooltip,
  Alert,
  AlertDialog,
} from '@/components/ui';
