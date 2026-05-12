/**
 * ESTE ARCHIVO ES EL ANTRY POINT PARA TODOS NUESTROS COMPONENTES. AQUÍ EXPORTAMOS TODOS
 * ESTAN ORDENADOS ALFAVETICAMENTE AQUI ESTABLECEREMOS SU REGISTRO EN EL COMENTARIO CON EL NOMBRE DEL COMENTARIO HEADER PARA QUE LO ENCUINETRN RAPIDO
 * IMPORTANTE:: FAVOR DE AGREGAR EL COMENTARIO HEADER Y REGISTRARLO AQUI
 * A:
 *  ALERT: COMPONENTES RELACIONADOS CON ALERTAS, INCLUYENDO ALERTAS DE ERROR, ÉXITO, ADVERTENCIA, ETC.
 *  ALERT DIALOG: COMPONENTE MODAL
 * B:
 *  BADGE: COMPONENTE BADGE
 *  BUTTON: COMPONENTES RELACIONADOS CON BOTONES, INCLUYENDO BOTONES PRINCIPALES, SECUNDARIOS, DE ACCIÓN, ETC.
 * C:
 *  CARD: COMPONENTE CARD
 *  CHECKBOX: COMPONENTE CHECBOX
 *  CONFIRM-MODAL: COMPONENTES RELACIONADOS CON MODALES DE CONFIRMACIÓN, INCLUYENDO MODALES DE ELIMINACIÓN, MODALES DE ADVERTENCIA, ETC.
 * D:
 *  DATERANGEPICKER: COMPONENTE DATEPICKER PARA TRABAJAR CON RANGOS DE FECHAS
 *  DATABLE: COMPONENTES RELACIONADOS CON LA TABLA DE DATOS, INCLUYENDO EL COMPONENTE PRINCIPAL, PAGINACIÓN, FILTROS, CABECERAS DE COLUMNA Y FUNCIONES AUXILIARES.
 *  DIALOG: COMPONENTES DEL DIALOG
 *  DROPDOWN-MENU: COMPONENTES RELACIONADOS CON MENÚS DESPLEGABLES, INCLUYENDO MENÚS DE ACCIONES, MENÚS DE OPCIONES, ETC.
 * I:
 *  INPUT: COMPONENTES RELACIONADOS CON CAMPOS DE ENTRADA DE DATOS, INCLUYENDO INPUTS DE TEXTO, SELECTORES, CHECKBOXES, ETC.
 * L:
 *  LABEL: COMPONENTES RELACIONADOS CON ETIQUETAS Y DESCRIPCIONES DE CAMPOS, INCLUYENDO LABELS, HELPERS, ETC.
 *  LOGOUTBUTTON: COMPONENTE BOTON PRINCIPAL DEL SISTMEA PARA CERRAR SESSION
 * M:
 *  MESSAGE-CONFIRMACION: COMPONENTES RELACIONADOS CON MENSAJES DE CONFIRMACIÓN PERSONALIZADOS, INCLUYENDO MODALES DE CONFIRMACIÓN, ALERTAS DE CONFIRMACIÓN, ETC.
 *  MODAL CUSTOM: COMPONENTES RELACIONADOS CON MODALES PERSONALIZADOS, INCLUYENDO MODALES DE CONFIRMACIÓN, MODALES DE FORMULARIOS, ETC.
 * P:
 *  PAGE-HEADER: COMPONENTES RELACIONADOS CON LOS ENCABEZADOS DE PÁGINA, INCLUYENDO TÍTULOS, SUBTÍTULOS, BREADCRUMBS, ETC.
 *  PAGE-WRAPPER: COMPONENTES RELACIONADOS CON EL ENVOLTORIO DE PÁGINAS, INCLUYENDO LAYOUTS, CONTENEDORES, ETC.
 * S:
 *  SELECT: COMPONENTES RELACIONADOS CON CAMPOS DE SELECCIÓN, INCLUYENDO SELECTORES DE OPCIONES, SELECTORES DE FECHA, ETC.
 *  SEPARATOR: COMPONENTE DE SEPARADOR
 *  STATCARD: COMPONENTE CADR DE ESTADISTICA
 *  SIDEBAR: COMPONENTE PRINCIPAL DEL SISTEMA
 * T:
 *  TABLE: COMPONENTE TABLA SENCILLO
 *  TEXTAREA:  TEXT AREA
 *  THEMETOGGLE: COMPONENTE PARA CAMBIAR DE TEMA CLARO/OBSCURO
 *  TOOLTIP: COMPONENTE TOOLTIP
 */

// ALERT
export { Alert, AlertDescription, AlertTitle } from "./ui/alert";

// ALERT DIALOG
export { AlertDialog,AlertDialogAction, AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogOverlay,AlertDialogPortal,AlertDialogTitle,AlertDialogTrigger } from './ui/alert-dialog'

// BADGE
export { Badge, badgeVariants } from "./ui/badge";
export type { BadgeProps } from "./ui/badge";

// BUTTON
export { Button } from "./ui/button";

// CARD
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"

// CHECBOX
export { Checkbox } from './ui/checkbox'

// CONFIRM-MODAL
export { ConfirmModal } from "./ui/confirm-modal";

// DATERANGEPICKER
export { DateRangePicker } from './dashboard/DateRangePicker'

// DATABLE
export { DataTable } from "./ui/datatble";
export { DataTablePagination } from "./ui/datatable-pagination";
export { DataTableFilters } from "./ui/datatable-filters";
export { DataTableColumnHeader, DataTableSortableHeader} from "./ui/datatable-columnheader";
export { exportToExcel, textFilter, selectFilter, multiselectFilter, numberRangeFilter, dateRangeFilter, booleanFilter, debounce, createSelectColumn, createActionsColumn } from "../lib/datatable";
export type { DataTableProps, PaginationConfig, PaginationMode, ExportConfig, FiltersConfig, FilterConfig, FilterType, FilterOption, RowSelectionConfig, ActionColumnConfig, DataTableInitialState, DataTablePaginationProps, DataTableFiltersProps, DataTableColumnHeaderProps, DataTableToolbarProps, TypedColumnDef, ExtractDataType, } from "../types/datable";

// DIALOG
export { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogOverlay, DialogPortal } from './ui/dialog'

// DROPDOWN-MENU
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuPortal,DropdownMenuRadioGroup,DropdownMenuRadioItem,DropdownMenuShortcut,DropdownMenuSub,DropdownMenuSubContent,DropdownMenuSubTrigger } from "./ui/dropdown-menu";

// FORM
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField } from "./ui/form";


// INPUT
export { Input } from "./ui/input";

// LABEL
export { Label } from "./ui/label";
export { LogoutButton } from './custom/LogoutButton'

// MODAL CUSTOM
export { MensajeConfirmacion } from "./custom/mensajeConfirmaacion";
export { ModalCustom } from "./custom/ModalCustom"; 

// PAGE-HEADER
export { PageHeader } from "./ui/page-header";

// PAGE-WRAPPER
export { PageWrapper } from "./ui/page-wrapper";

// POPOVER
export { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";

// SCROLL AREA
export { ScrollArea, ScrollBar } from "./ui/scroll-area";

// SELECT
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectGroup,SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator } from "./ui/select";

// SEPARATOR
export { Separator } from "./ui/separator"

// STATCARD
export { StatCard } from './dashboard/StatCard'

// SIDEBAR
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar  } from './ui/sidebar'

// TABLE
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from './ui/table'

// TEXTAREA
export { Textarea } from './ui/textarea'

export { ThemeToggle, ThemeToggleCompact, ThemeToggleHeader } from './ui/theme-toggle'

// TOOLTIP
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'