
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useImportUserData } from "@/hooks/useImportUserData";

export const useSessionImport = (
  userId: string | null,
  email: string | null,
  isAuthenticated: boolean
) => {
  const [dataImported, setDataImported] = useState(false);
  const { toast } = useToast();
  const { importUserData, isImporting, isImportComplete } = useImportUserData(userId, email);

  useEffect(() => {
    // Only run once when a user is authenticated and we haven't imported yet
    if (isAuthenticated && userId && email && !dataImported && !isImporting && !isImportComplete) {
      // Using setTimeout to ensure session is fully established
      const timer = setTimeout(() => {
        importUserData();
        setDataImported(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, userId, email, dataImported, isImporting, isImportComplete, importUserData]);

  return { dataImported, isImporting };
};
