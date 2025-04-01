"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Download, MoreHorizontal, Mail, Phone, Globe, Plus, Trash, Edit, Star, StarOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import * as React from "react"

// Mock data for contacts
const contacts = [
  {
    id: "1",
    name: "John Smith",
    company: "Sunrise Cafe",
    position: "Owner",
    email: "john@sunrisecafe.com",
    phone: "503-555-1234",
    website: "https://sunrisecafe.com",
    tags: ["Restaurant", "Portland"],
    favorite: true,
  },
  {
    id: "2",
    name: "Sarah Johnson",
    company: "Downtown Dental",
    position: "Office Manager",
    email: "sarah@downtowndental.com",
    phone: "503-555-5678",
    website: "https://downtowndental.com",
    tags: ["Healthcare", "Portland"],
    favorite: false,
  },
  {
    id: "3",
    name: "Michael Chen",
    company: "Tech Solutions",
    position: "CEO",
    email: "michael@techsolutions.com",
    phone: "503-555-9012",
    website: "https://techsolutions.com",
    tags: ["Technology", "Portland"],
    favorite: true,
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    company: "Green Thumb Nursery",
    position: "Marketing Director",
    email: "emily@greenthumb.com",
    phone: "503-555-3456",
    website: "https://greenthumb.com",
    tags: ["Retail", "Beaverton"],
    favorite: false,
  },
  {
    id: "5",
    name: "David Wilson",
    company: "Riverfront Restaurant",
    position: "General Manager",
    email: "david@riverfrontrestaurant.com",
    phone: "503-555-7890",
    website: "https://riverfrontrestaurant.com",
    tags: ["Restaurant", "Portland"],
    favorite: false,
  },
]

export default function ContactsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filteredContacts, setFilteredContacts] = React.useState(contacts)
  const [showAddContact, setShowAddContact] = React.useState(false)

  React.useEffect(() => {
    if (searchQuery) {
      const filtered = contacts.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredContacts(filtered)
    } else {
      setFilteredContacts(contacts)
    }
  }, [searchQuery])

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>Manage your business contacts and leads</CardDescription>
            </div>
            <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 w-full sm:w-auto">
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Contact</DialogTitle>
                  <DialogDescription>Enter the details for your new business contact.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input id="name" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company" className="text-right">
                      Company
                    </Label>
                    <Input id="company" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="position" className="text-right">
                      Position
                    </Label>
                    <Input id="position" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">
                      Email
                    </Label>
                    <Input id="email" type="email" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone" className="text-right">
                      Phone
                    </Label>
                    <Input id="phone" type="tel" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="website" className="text-right">
                      Website
                    </Label>
                    <Input id="website" type="url" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="tags" className="text-right">
                      Tags
                    </Label>
                    <Input id="tags" placeholder="Separate with commas" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">
                      Notes
                    </Label>
                    <Textarea id="notes" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Contact</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search contacts..."
                className="w-full pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="rounded-md border overflow-auto">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="min-w-[150px]">Name</TableHead>
                    <TableHead className="min-w-[150px]">Company</TableHead>
                    <TableHead className="min-w-[150px]">Position</TableHead>
                    <TableHead className="min-w-[120px]">Contact</TableHead>
                    <TableHead className="min-w-[150px]">Tags</TableHead>
                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No contacts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            {contact.favorite ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                            <span className="sr-only">Toggle favorite</span>
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="break-words">{contact.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="break-words">{contact.company}</TableCell>
                        <TableCell className="break-words">{contact.position}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <Mail className="h-4 w-4 flex-shrink-0" />
                            </a>
                            <a
                              href={`tel:${contact.phone}`}
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <Phone className="h-4 w-4 flex-shrink-0" />
                            </a>
                            <a
                              href={contact.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center"
                            >
                              <Globe className="h-4 w-4 flex-shrink-0" />
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="break-words">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  )
}

