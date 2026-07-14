import {
  type JSX,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useRef,
  useState
} from 'react';
import { Input } from '../forms/index.js';
import { cn } from '../utils.js';

/** Pixel width of the chevron notch shared between interlocking segments. */
const CHEVRON_PX = 9;

/**
 * One non-editable breadcrumb segment rendered before the trailing editable item.
 */
export interface BreadcrumbSegment {
  /**
   * Visible label for the segment.
   */
  label: string;

  /**
   * Optional stable key; falls back to the segment index when omitted.
   */
  id?: string;

  /**
   * When set, the segment renders as a navigable button.
   */
  onClick?: () => void;
}

interface Props {
  /**
   * Leading, non-editable crumbs (collection, folder, and so on).
   */
  segments: BreadcrumbSegment[];

  /**
   * Current value of the trailing, inline-editable segment.
   */
  value: string;

  /**
   * Placeholder shown when the editable value is empty.
   */
  placeholder?: string;

  /**
   * Accessible name for the editable trailing segment input.
   */
  editableLabel?: string;

  /**
   * Called when the editable trailing segment changes.
   */
  onValueChange: (value: string) => void;

  /**
   * Additional classes merged onto the outer breadcrumb bar.
   */
  className?: string;

  /**
   * When true, applies negative horizontal and top margins so the bar sits
   * flush against the edges of a parent with `p-3` padding.
   */
  flush?: boolean;
}

/**
 * Shape position within the interlocking breadcrumb bar.
 */
type SegmentShape = 'first' | 'middle' | 'last' | 'only';

/**
 * Returns a CSS clip-path polygon for the given segment shape.
 *
 * @param shape - Which segment position to clip for.
 * @returns Clip-path polygon string for inline style use.
 */
function clipPathForShape(shape: SegmentShape): string {
  switch (shape) {
    case 'first':
      return `polygon(0 0, calc(100% - ${CHEVRON_PX}px) 0, 100% 50%, calc(100% - ${CHEVRON_PX}px) 100%, 0 100%)`;
    case 'middle':
      return `polygon(0 0, calc(100% - ${CHEVRON_PX}px) 0, 100% 50%, calc(100% - ${CHEVRON_PX}px) 100%, 0 100%, ${CHEVRON_PX}px 50%)`;
    case 'last':
      return `polygon(0 0, 100% 0, 100% 100%, 0 100%, ${CHEVRON_PX}px 50%)`;
    case 'only':
    default:
      return 'none';
  }
}

/**
 * Shared shell classes and clip-path styling for one breadcrumb segment.
 */
interface SegmentShellProps {
  /**
   * Segment position within the bar.
   */
  shape: SegmentShape;

  /**
   * When true, the segment grows to fill remaining horizontal space.
   */
  grow?: boolean;

  /**
   * Additional classes merged onto the segment shell.
   */
  className?: string;

  /**
   * Segment contents.
   */
  children: ReactNode;
}

/**
 * Renders the arrow-shaped background shell shared by crumb and editable segments.
 */
function SegmentShell({
  shape,
  grow = false,
  className,
  children
}: SegmentShellProps): JSX.Element {
  const hasChevron = shape !== 'only';
  const clipPath = clipPathForShape(shape);
  const needsLeadingInset = shape !== 'first' && shape !== 'only';

  return (
    <div
      className={cn(
        'hc-breadcrumb-segment relative flex min-h-[30px] min-w-0 items-center bg-sidebar py-2',
        grow ? 'min-w-[6rem] flex-1' : 'max-w-[45%] shrink-0',
        hasChevron && shape !== 'last' && '-mr-[6px]',
        !needsLeadingInset && 'pl-3',
        'pr-3',
        className
      )}
      style={{
        ...(clipPath !== 'none' ? { clipPath } : {}),
        ...(needsLeadingInset ? { paddingLeft: `${CHEVRON_PX + 8}px` } : {})
      }}
    >
      <div className="min-w-0 truncate">{children}</div>
    </div>
  );
}

interface CrumbSegmentProps {
  /**
   * Crumb data and optional navigation handler.
   */
  segment: BreadcrumbSegment;

  /**
   * Segment position within the bar.
   */
  shape: SegmentShape;
}

/**
 * Renders one leading, non-editable breadcrumb segment.
 */
function CrumbSegment({ segment, shape }: CrumbSegmentProps): JSX.Element {
  const contentClass = cn(
    'block w-full truncate border-none bg-transparent p-0 text-left',
    segment.onClick && 'cursor-pointer hover:text-text focus-visible:text-text'
  );

  /**
   * Stops click propagation so breadcrumb navigation does not trigger edit mode.
   *
   * @param event - Mouse event from a breadcrumb segment control.
   */
  const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
    event.stopPropagation();
    segment.onClick?.();
  };

  return (
    <SegmentShell shape={shape}>
      {segment.onClick ? (
        <button
          type="button"
          className={cn(
            contentClass,
            'app-no-drag focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent'
          )}
          onClick={handleClick}
        >
          {segment.label}
        </button>
      ) : (
        <span className={contentClass}>{segment.label}</span>
      )}
    </SegmentShell>
  );
}

interface EditableSegmentProps {
  /**
   * Current editable value.
   */
  value: string;

  /**
   * Placeholder when the value is empty.
   */
  placeholder: string;

  /**
   * Accessible name for the editable input.
   */
  editableLabel: string;

  /**
   * Whether inline edit mode is active.
   */
  editing: boolean;

  /**
   * Segment position within the bar.
   */
  shape: SegmentShape;

  /**
   * Ref forwarded to the inline input when editing.
   */
  inputRef: RefObject<HTMLInputElement | null>;

  /**
   * Opens inline edit mode for the trailing segment.
   */
  onStartEditing: () => void;

  /**
   * Closes inline edit mode for the trailing segment.
   */
  onStopEditing: () => void;

  /**
   * Called when the editable value changes.
   */
  onValueChange: (value: string) => void;
}

/**
 * Renders the trailing breadcrumb segment with click-to-edit behavior.
 */
function EditableSegment({
  value,
  placeholder,
  editableLabel,
  editing,
  shape,
  inputRef,
  onStartEditing,
  onStopEditing,
  onValueChange
}: EditableSegmentProps): JSX.Element {
  return (
    <SegmentShell shape={shape} grow>
      {editing ? (
        <Input
          ref={inputRef}
          variant="plain"
          aria-label={editableLabel}
          className="app-no-drag w-full min-w-0 border-none bg-transparent p-0 font-semibold text-text outline-none"
          type="text"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          onBlur={onStopEditing}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Escape') {
              event.preventDefault();
              onStopEditing();
            }
          }}
        />
      ) : (
        <button
          type="button"
          aria-current="page"
          aria-label={editableLabel}
          className="app-no-drag flex w-full min-w-0 cursor-text items-center border-none bg-transparent p-0 text-left font-semibold text-text hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent"
          onClick={onStartEditing}
        >
          <span className="min-w-0 truncate">
            {value ? value : <span className="font-normal text-muted">{placeholder}</span>}
          </span>
        </button>
      )}
    </SegmentShell>
  );
}

/**
 * Full-width breadcrumb bar with interlocking arrow-shaped segments. Leading
 * segments are optionally clickable; the trailing segment is inline-editable.
 */
export function Breadcrumb({
  segments,
  value,
  placeholder = '',
  editableLabel = 'Name',
  onValueChange,
  className,
  flush = false
}: Props): JSX.Element {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navId = useId();

  /**
   * Focuses and selects the trailing input when inline edit mode opens.
   */
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  /**
   * Resolves the clip-path shape for a leading segment at the given index.
   *
   * @param index - Zero-based index within the leading segments array.
   * @returns Shape token used by the segment shell.
   */
  const leadingShape = (index: number): SegmentShape => {
    if (segments.length === 1) return 'first';
    if (index === 0) return 'first';
    return 'middle';
  };

  const editableShape: SegmentShape = segments.length === 0 ? 'only' : 'last';

  return (
    <nav
      id={navId}
      aria-label="Breadcrumb"
      className={cn(
        'hc-breadcrumb flex min-w-0 items-stretch',
        flush ? '-mx-3 -mt-3 w-[calc(100%+1.5rem)]' : 'w-full',
        className
      )}
    >
      {segments.map((segment, index) => (
        <CrumbSegment
          key={segment.id ?? `${segment.label}-${index}`}
          segment={segment}
          shape={leadingShape(index)}
        />
      ))}
      <EditableSegment
        value={value}
        placeholder={placeholder}
        editableLabel={editableLabel}
        editing={editing}
        shape={editableShape}
        inputRef={inputRef}
        onStartEditing={() => setEditing(true)}
        onStopEditing={() => setEditing(false)}
        onValueChange={onValueChange}
      />
    </nav>
  );
}
