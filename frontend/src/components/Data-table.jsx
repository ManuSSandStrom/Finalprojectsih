import { useState } from "react"
import { Filter, MoreHorizontal, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DataTable({ data, columns, searchKey, loading = false, onEdit, onDelete, onView }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortColumn, setSortColumn] = useState(null)
  const [sortDirection, setSortDirection] = useState("asc")

  const filteredData = data.filter((item) => {
    if (!searchTerm || !searchKey) return true
    const value = item[searchKey]
    return String(value).toLowerCase().includes(searchTerm.toLowerCase())
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = String(a[sortColumn] || "")
    const bValue = String(b[sortColumn] || "")
    return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
  })

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 rounded-xl border border-slate-600/30 bg-gradient-to-r from-slate-800/40 to-slate-700/40 backdrop-blur-sm animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl border border-slate-600/20 bg-gradient-to-r from-slate-800/30 to-slate-700/30 backdrop-blur-sm animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-12 rounded-xl border-slate-700/50 bg-slate-950/70 pl-12 text-slate-100 placeholder:text-slate-400 backdrop-blur-sm transition-all duration-300 hover:bg-slate-950/85 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-12 rounded-xl border-slate-700/50 bg-slate-950/70 px-6 text-slate-300 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/70 hover:bg-slate-900/80 hover:text-white"
        >
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-700/40 bg-slate-950/60 shadow-2xl backdrop-blur-sm">
        <Table className="min-w-[760px]">
          <TableHeader>
            <TableRow className="border-b border-slate-700/40 hover:bg-slate-900/40">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`px-6 py-4 font-semibold text-slate-200 ${
                    column.sortable ? "cursor-pointer transition-all duration-300 hover:bg-slate-900/50" : ""
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortColumn === column.key && (
                      <span className="text-slate-400 font-bold text-xs">{sortDirection === "asc" ? "ASC" : "DESC"}</span>
                    )}
                  </div>
                </TableHead>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableHead className="w-[80px] px-6 py-4 font-semibold text-slate-200">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="bg-slate-950/20 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/70">
                      <Search className="h-8 w-8 text-slate-500" />
                    </div>
                    <p className="text-lg">No records found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow
                  key={item._id}
                  className="group border-b border-slate-700/25 transition-all duration-300 hover:bg-slate-900/40"
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="px-6 py-4 text-slate-200 transition-colors duration-300 group-hover:text-slate-100">
                      {column.render ? column.render(item) : String(item[column.key] || "")}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 rounded-xl p-0 text-slate-400 transition-all duration-300 hover:scale-110 hover:bg-slate-800/70 hover:text-white"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-xl border-slate-700/40 bg-slate-950/95 text-slate-200 shadow-2xl backdrop-blur-xl"
                        >
                          {onView && (
                            <DropdownMenuItem
                              onClick={() => onView(item)}
                              className="rounded-lg transition-colors duration-300 hover:bg-slate-800/80 hover:text-white"
                            >
                              View
                            </DropdownMenuItem>
                          )}
                          {onEdit && (
                            <DropdownMenuItem
                              onClick={() => onEdit(item)}
                              className="rounded-lg transition-colors duration-300 hover:bg-slate-800/80 hover:text-white"
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              onClick={() => onDelete(item)}
                              className="rounded-lg text-red-400 transition-colors duration-300 hover:bg-red-950/40 hover:text-red-300"
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="rounded-xl border border-slate-700/40 bg-slate-950/40 px-4 py-2 text-slate-400 backdrop-blur-sm">
          Showing <span className="font-semibold text-slate-200">{sortedData.length}</span> of{" "}
          <span className="font-semibold text-slate-200">{data.length}</span> records
          {searchTerm && (
            <span className="text-slate-300">
              {" "}
              for "<span className="font-medium text-indigo-300">{searchTerm}</span>"
            </span>
          )}
        </div>
      </div>
    </div>
  )
}


