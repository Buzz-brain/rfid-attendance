import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import SearchBar from "../components/SearchBar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import useStore from "../store/useStore";
import { toast } from "sonner";

const Students = () => {
  const students = useStore((state) => state.students);
  const user = useStore((state) => state.user);
  const fetchStudents = useStore((state) => state.fetchStudents);
  const addStudent = useStore((state) => state.addStudent);
  const deleteStudent = useStore((state) => state.deleteStudent);
  const updateStudent = useStore((state) => state.updateStudent);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchStudents();
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    regNo: "",
    rfidTag: "",
    // fixed department for this deployment
    department: "Information Technology (IFT)",
    level: "",
    photo: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    regNo: "",
    rfidTag: "",
    department: "",
    level: "",
    photo: "",
  });

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rfidTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addStudent(formData);
    if (result.success) {
      toast.success("Student added successfully!");
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        regNo: "",
        rfidTag: "",
        department: "Information Technology (IFT)",
        level: "",
        photo: "",
      });
    } else {
      toast.error(result.error || "Failed to add student");
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteStudent(id);
      toast.success("Student deleted successfully");
      // Immediately refetch students so the table updates without a full reload
      try {
        await fetchStudents();
      } catch (err) {
        console.error("Failed to refetch students after delete", err);
      }
    }
  };

  const openEditModal = (student) => {
    setEditStudentId(student._id);
    setEditFormData({
      name: student.name,
      regNo: student.regNo,
      rfidTag: student.rfidTag,
      department: student.department,
      level: student.level,
      photo: student.photo || "",
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateStudent(editStudentId, editFormData);
    toast.success("Student updated successfully!");
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Students</h1>
          <p className="text-muted-foreground">
            Manage student records and RFID tags
          </p>
        </div>
        {/* Only allow add/edit/delete for non-lecturer roles */}
        {!user || user?.role !== "lecturer" ? (
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Provide the student's full details to add them to the system.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="regNo">Registration Number *</Label>
                    <Input
                      id="regNo"
                      value={formData.regNo}
                      onChange={(e) =>
                        setFormData({ ...formData, regNo: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfidTag">RFID Tag ID *</Label>
                    <Input
                      id="rfidTag"
                      value={formData.rfidTag}
                      onChange={(e) =>
                        setFormData({ ...formData, rfidTag: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      readOnly
                      disabled
                      aria-readonly
                      className="cursor-not-allowed bg-secondary/5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Department fixed to Information Technology (IFT)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level *</Label>
                    <Input
                      id="level"
                      placeholder="e.g., 400L"
                      value={formData.level}
                      onChange={(e) =>
                        setFormData({ ...formData, level: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo">Photo URL</Label>
                    <Input
                      id="photo"
                      type="url"
                      placeholder="https://..."
                      value={formData.photo}
                      onChange={(e) =>
                        setFormData({ ...formData, photo: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="gradient-primary">
                    Add Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      <div className="glass rounded-xl p-6">
        {loading && (
          <div className="text-center py-12 text-muted-foreground">
            Loading students...
          </div>
        )}
        <div className="mb-6">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, reg number, or RFID tag..."
            className="max-w-md"
            onClear={() => setSearchTerm("")}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-sm">
                  Photo
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm">
                  Name
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm">
                  Reg No.
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm">
                  RFID Tag
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm">
                  Department
                </th>
                <th className="text-left py-3 px-4 font-semibold text-sm">
                  Level
                </th>
                {!user || user?.role !== "lecturer" ? (
                  <th className="text-right py-3 px-4 font-semibold text-sm">
                    Actions
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <motion.tr
                  key={student._id || student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <Avatar>
                      <AvatarImage src={student.photo} alt={student.name} />
                      <AvatarFallback>
                        {student.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="py-3 px-4 font-medium">{student.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {student.regNo}
                  </td>
                  <td className="py-3 px-4">
                    <code className="px-2 py-1 bg-secondary rounded text-xs">
                      {student.rfidTag}
                    </code>
                  </td>
                  <td className="py-3 px-4 text-sm">{student.department}</td>
                  <td className="py-3 px-4 text-sm">{student.level}</td>
                  {!user || user?.role !== "lecturer" ? (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(
                              student._id || student.id,
                              student.name
                            )
                          }
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No students found matching your search</p>
          </div>
        )}
      </div>
      {/* Edit Student Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update the student's information and save your changes.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-regNo">Registration Number *</Label>
                <Input
                  id="edit-regNo"
                  value={editFormData.regNo}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, regNo: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-rfidTag">RFID Tag ID *</Label>
                <Input
                  id="edit-rfidTag"
                  value={editFormData.rfidTag}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      rfidTag: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-department">Department *</Label>
                <Input
                  id="edit-department"
                  value={editFormData.department}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      department: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">Level *</Label>
                <Input
                  id="edit-level"
                  placeholder="e.g., 400L"
                  value={editFormData.level}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, level: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-photo">Photo URL</Label>
                <Input
                  id="edit-photo"
                  type="url"
                  placeholder="https://..."
                  value={editFormData.photo}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, photo: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gradient-primary">
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Students;
