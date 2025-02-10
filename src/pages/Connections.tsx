import { useState } from "react";
import { useDuckStore, ConnectionProvider } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Database, ExternalLink } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog"; // Import DialogFooter
import { ConnectionDisclaimer } from "@/components/connection/Disclaimer";
import ConnectionManager from "@/components/connection/ConnectionsModal";

// Define ConnectionFormValues type here for use in Connections component
import * as z from "zod";
const connectionSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Connection name must be at least 2 characters.",
    })
    .max(30, {
      message: "Connection name must not exceed 30 characters.",
    }),
  scope: z.enum(["External"]),
  host: z.string().url({
    message: "Host must be a valid URL.",
  }),
  port: z
    .string()
    .refine((val) => !isNaN(parseInt(val, 10)) || val === "", {
      //Allow empty string
      message: "Port must be a number.",
    })
    .optional(),
  database: z.string().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  authMode: z.enum(["none", "password", "api_key"]).optional(),
  apiKey: z.string().optional(),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

const Connections = () => {
  const {
    connectionList,
    addConnection,
    updateConnection,
    deleteConnection,
    getConnection,
    setCurrentConnection,
    currentConnection,
    isLoadingExternalConnection, // Get the loading state
    isLoading,
  } = useDuckStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingConnectionId, setEditingConnectionId] = useState<string | null>(
    null
  );
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<
    string | null
  >(null);
  const [isAddConnectionDialogOpen, setIsAddConnectionDialogOpen] =
    useState(false);
  const [editingConnection, setEditingConnection] = useState<
    ConnectionFormValues | undefined
  >(undefined);

  const handleAddConnection = async (values: ConnectionFormValues) => {
    const connectionData: ConnectionProvider = {
      ...values,
      id: crypto.randomUUID(),
      port: values.port ? parseInt(values.port, 10) : undefined,
    };
    await addConnection(connectionData);
  };

  const handleUpdateConnection = async (values: ConnectionFormValues): Promise<void> => {
    if (!editingConnectionId) return;

    const connectionData: ConnectionProvider = {
      ...values,
      id: editingConnectionId,
      port: values.port ? parseInt(values.port, 10) : undefined,
    };
    updateConnection(connectionData);
    setEditingConnectionId(null);
    setIsEditing(false);
  };

  const handleConnect = async (connectionId: string) => {
    try {
      await setCurrentConnection(connectionId);
    } catch (error) {
      console.error("Failed to connect:", error);
    }
  };

  const onEdit = (connectionId: string) => {
    const connection = getConnection(connectionId);
    if (connection) {
      setEditingConnectionId(connectionId);
      setEditingConnection({
        ...connection,
        scope: "External",
        host: connection.host || "",
        port: connection.port?.toString() || "",
      });
      setIsEditing(true);
    }
  };

  const onCancelEdit = () => {
    setIsEditing(false);
    setEditingConnectionId(null);
    setEditingConnection(undefined);
  };


  return (
    <div className="container mx-auto p-4 space-y-6 overflow-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Connections</h1>
        <Button
          onClick={() => setIsAddConnectionDialogOpen(true)}
          className="flex items-center gap-2"
          variant="outline"
          disabled={isLoadingExternalConnection}
        >
          <Plus />
          Add Connection
        </Button>

        {/* Use ConnectionManager for adding connections */}
        <ConnectionManager
          open={isAddConnectionDialogOpen}
          onOpenChange={setIsAddConnectionDialogOpen}
          onSubmit={handleAddConnection}
          isEditMode={false} // Ensure it's in add mode
        />
      </div>
      <ConnectionDisclaimer />

      {/* Editing Connection Card - using ConnectionManager */}
      {isEditing && editingConnection ? (
        <Card className="w-full max-w-2xl mx-auto mb-8">
          <CardHeader>
            <CardTitle>Edit Connection</CardTitle>
            <CardDescription>
              Modify existing connection details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Use ConnectionManager for editing connections */}
            <ConnectionManager
              open={isEditing}
              onOpenChange={setIsEditing}
              onSubmit={handleUpdateConnection}
              initialValues={editingConnection}
              isEditMode={true} // Set to edit mode
            />
          </CardContent>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={onCancelEdit}>
              Cancel
            </Button>
          </DialogFooter>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Available Connections</CardTitle>
          <CardDescription>
            List of all configured database connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-400px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Host</TableHead>
                  <TableHead>Database</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectionList.connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell
                      className={
                        connection.id === currentConnection?.id
                          ? "border-l-4 border-green-500"
                          : ""
                      }
                    >
                      <div className="flex items-center gap-2">
                        {connection.scope === "WASM" ? (
                          <Database size={16} />
                        ) : (
                          <ExternalLink size={16} />
                        )}
                        {connection.name}
                      </div>
                    </TableCell>
                    <TableCell>{connection.scope}</TableCell>
                    <TableCell>
                      {connection.host ||
                        (connection.scope === "WASM" ? "Local" : "-")}
                    </TableCell>
                    <TableCell>
                      {connection.database ||
                        (connection.scope === "WASM" ? "memory" : "-")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={
                            connection.id === currentConnection?.id || isLoading
                          }
                          onClick={() => handleConnect(connection.id)}
                        >
                          {connection.id === currentConnection?.id
                            ? "Connected"
                            : "Connect"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(connection.id)}
                          disabled={connection.id === "WASM"}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <AlertDialog
                          open={deleteConfirmationId === connection.id}
                          onOpenChange={(isOpen) =>
                            setDeleteConfirmationId(
                              isOpen ? connection.id : null
                            )
                          }
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={connection.id === "WASM"}
                            >
                              <Trash2 size={16} className="text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Connection
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete the connection "
                                {connection.name}"? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  deleteConnection(connection.id);
                                  setDeleteConfirmationId(null);
                                }}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connections;
