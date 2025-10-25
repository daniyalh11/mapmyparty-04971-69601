import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Calendar, Clock, Globe, Upload, X } from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { useEvents } from "@/hooks/useEvents";
import eventMusic from "@/assets/event-music.jpg";

type Step = 1 | 2 | 3 | 4 | 5;

const CreateEvent = () => {
  const navigate = useNavigate();
  const { addEvent } = useEvents();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [eventType, setEventType] = useState("one-time");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  // Form data
  const [eventTitle, setEventTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [ticketPrice, setTicketPrice] = useState("49");

  const steps = [
    { number: 1, title: "Event Details" },
    { number: 2, title: "Dates & Times" },
    { number: 3, title: "Venue & Location" },
    { number: 4, title: "Tickets" },
    { number: 5, title: "Additional Info" },
  ];

  const progress = (currentStep / 5) * 100;

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGalleryImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (isDraft: boolean) => {
    // Validation
    if (!eventTitle || selectedCategories.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Create the event
    const newEvent = addEvent({
      title: eventTitle,
      date: "Coming Soon",
      location: `${venueName || "TBD"}, ${city || "TBD"}${state ? `, ${state}` : ""}`,
      image: coverImage || eventMusic,
      category: selectedCategories[0] || "General",
      price: ticketPrice ? `From ₹${ticketPrice}` : "Free",
      status: isDraft ? "draft" : "published",
    });

    toast.success(
      isDraft ? "Event saved as draft!" : "Event published successfully!"
    );
    
    navigate("/organizer/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header isAuthenticated userRole="organizer" />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Progress Header */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold mb-2">Create New Event</h1>
                <p className="text-muted-foreground">
                  Step {currentStep} of 5: {steps[currentStep - 1].title}
                </p>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-4">
                {steps.map((step) => (
                  <div
                    key={step.number}
                    className={`flex items-center gap-2 text-sm ${
                      step.number === currentStep
                        ? "text-primary font-semibold"
                        : step.number < currentStep
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        step.number < currentStep
                          ? "bg-primary border-primary text-primary-foreground"
                          : step.number === currentStep
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {step.number < currentStep ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span className="hidden md:inline">{step.title}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Event Details */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Event Title *</Label>
                    <Input
                      id="event-title"
                      placeholder="Enter event title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Event Categories (up to 5)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Music", "Conference", "Food & Drink", "Sports", "Arts", "Workshop"].map(
                        (category) => (
                          <div key={category} className="flex items-center space-x-2">
                            <Checkbox 
                              id={category}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedCategories([...selectedCategories, category]);
                                } else {
                                  setSelectedCategories(selectedCategories.filter(c => c !== category));
                                }
                              }}
                            />
                            <label htmlFor={category} className="text-sm cursor-pointer">
                              {category}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cover-image">Cover Image *</Label>
                    <div className="space-y-3">
                      <Input 
                        id="cover-image" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleCoverImageChange}
                        className="cursor-pointer"
                      />
                      {coverImage && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                          <img 
                            src={coverImage} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setCoverImage(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gallery">Gallery Images (optional)</Label>
                    <div className="space-y-3">
                      <Input 
                        id="gallery" 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handleGalleryImagesChange}
                        className="cursor-pointer"
                      />
                      {galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {galleryImages.map((img, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                              <img 
                                src={img} 
                                alt={`Gallery preview ${index + 1}`} 
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeGalleryImage(index)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Event Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your event..."
                      rows={6}
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 2: Dates & Times */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label>Event Type *</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time Event</SelectItem>
                        <SelectItem value="recurring">Recurring Event</SelectItem>
                        <SelectItem value="no-date">No Fixed Date</SelectItem>
                        <SelectItem value="custom">Custom Dates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {eventType === "one-time" && (
                    <>
                      <div className="space-y-6">
                        {/* Date Input */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <Label className="text-base font-semibold">Start Date *</Label>
                          </div>
                          <Input id="start-date" type="date" required className="max-w-md" />
                        </div>

                        {/* Time Input */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-accent" />
                            </div>
                            <Label className="text-base font-semibold">Start Time *</Label>
                          </div>
                          <Input id="start-time" type="time" required className="max-w-md" />
                        </div>

                        {/* End Date Input */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <Label className="text-base font-semibold">End Date *</Label>
                          </div>
                          <Input id="end-date" type="date" required className="max-w-md" />
                        </div>

                        {/* End Time Input */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-accent" />
                            </div>
                            <Label className="text-base font-semibold">End Time *</Label>
                          </div>
                          <Input id="end-time" type="time" required className="max-w-md" />
                        </div>

                        {/* Timezone Input */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Globe className="w-5 h-5 text-primary" />
                            </div>
                            <Label className="text-base font-semibold">Timezone *</Label>
                          </div>
                          <Select defaultValue="utc">
                            <SelectTrigger className="max-w-md">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="utc">UTC (GMT+0)</SelectItem>
                              <SelectItem value="est">Eastern (GMT-5)</SelectItem>
                              <SelectItem value="cst">Central (GMT-6)</SelectItem>
                              <SelectItem value="mst">Mountain (GMT-7)</SelectItem>
                              <SelectItem value="pst">Pacific (GMT-8)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  {eventType === "recurring" && (
                    <>
                      <div className="space-y-2">
                        <Label>Recurrence Pattern *</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select pattern" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="rec-start">Starts On *</Label>
                          <Input id="rec-start" type="date" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rec-end">Ends On *</Label>
                          <Input id="rec-end" type="date" required />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Step 3: Venue & Location */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="venue-name">Venue Name *</Label>
                    <Input
                      id="venue-name"
                      placeholder="Enter venue name"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input 
                        id="city" 
                        placeholder="City" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input 
                        id="state" 
                        placeholder="State" 
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code *</Label>
                      <Input id="zip" placeholder="ZIP" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" placeholder="contact@event.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Venue Website</Label>
                    <Input id="website" type="url" placeholder="https://venue.com" />
                  </div>

                  <div className="space-y-2">
                    <Label>Map Preview</Label>
                    <div className="bg-muted rounded-lg h-48 flex items-center justify-center border border-border">
                      <p className="text-muted-foreground">
                        Map will update based on address
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Tickets */}
              {currentStep === 4 && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Ticket Types</h3>
                      <Button variant="outline" size="sm">
                        + Add Ticket Type
                      </Button>
                    </div>

                    {/* Ticket Type 1 */}
                    <Card>
                      <CardContent className="p-4 space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Ticket Name *</Label>
                            <Input placeholder="e.g., General Admission" />
                          </div>
                          <div className="space-y-2">
                            <Label>Ticket Type *</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="vip">VIP</SelectItem>
                                <SelectItem value="earlybird">Early Bird</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price ($) *</Label>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              min="0" 
                              step="0.01" 
                              value={ticketPrice}
                              onChange={(e) => setTicketPrice(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Total Quantity *</Label>
                            <Input type="number" placeholder="100" min="1" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe what's included..."
                            rows={2}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Max Per Customer</Label>
                          <Input type="number" placeholder="10" min="1" />
                        </div>

                        <div className="flex gap-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="coming-soon" />
                            <label htmlFor="coming-soon" className="text-sm cursor-pointer">
                              Coming Soon
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="on-site" />
                            <label htmlFor="on-site" className="text-sm cursor-pointer">
                              On-site Only
                            </label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}

              {/* Step 5: Additional Info */}
              {currentStep === 5 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <Textarea
                      id="terms"
                      placeholder="Enter any terms and conditions..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Custom Questions for Attendees</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input placeholder="Question (e.g., Dietary requirements?)" />
                        <Button variant="outline" size="sm">
                          + Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Organizer Notes (Private)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any internal notes..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button onClick={nextStep}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => handleSubmit(true)}>
                  Save as Draft
                </Button>
                <Button variant="accent" onClick={() => handleSubmit(false)}>
                  Publish Event
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateEvent;
